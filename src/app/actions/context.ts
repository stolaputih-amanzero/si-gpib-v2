'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { SupabaseIdentityResolver } from '@/lib/authorization/engine/identity-resolver';
import { SupabaseContextResolver } from '@/lib/authorization/engine/context-resolver';
import { isResolutionFailure } from '@/lib/authorization/engine/resolver.types';
import { getServerContext } from '@/lib/utils/context';

export async function setWorkingContext(context_id: string) {
  const context = await getServerContext();
  
  if (!context || context.status === 'UNAUTHORIZED' || !context.user) {
    throw new Error('Unauthorized: No active session');
  }

  const userId = context.user.id;
  const supabase = await createClient();

  const identityResolver = new SupabaseIdentityResolver(supabase);
  const baseIdentity = await identityResolver.resolveBaseIdentity(userId);

  if (!baseIdentity) {
    throw new Error('Unauthorized: User identity could not be resolved');
  }

  const contextResolver = new SupabaseContextResolver(supabase);
  const activeContext = await contextResolver.resolveActiveContext(userId, context_id);

  if (isResolutionFailure(activeContext)) {
    // If invalid context, reject the change
    throw new Error(`Forbidden: ${activeContext.diagnosticMessage}`);
  }

  // Constraint A: Minimal payload (only context_id)
  const cookieStore = await cookies();
  cookieStore.set('sigpib_active_context', context_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  revalidatePath('/', 'layout');
  return { success: true, context_id };
}

import { createClient as createAdminClient } from '@supabase/supabase-js';

export interface ContextOption {
  id_pos: string;
  nama_pos: string;
  level: 'MUPEL' | 'JEMAAT' | 'POS';
}

export async function getAssignedPosListAction(): Promise<ContextOption[]> {
  const contextData = await getServerContext();
  const activeId = contextData.context_id || 'POS-43938';

  const rawList: ContextOption[] = [];

  // 1. If user is authenticated, query based on role & assignment
  if (contextData.user) {
    try {
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const user = contextData.user;
      const email = (user.email || '').toLowerCase().trim();
      const isSuperUser = email.includes('stolaputih') || email.includes('superadmin') || email.includes('sinode') || user.role === 'super_user';

      if (isSuperUser) {
        // Super User: Fetch all Mupel, Jemaat Induk, and Pos Pelkes
        const [mupelRes, jmtRes, posRes] = await Promise.all([
          supabaseAdmin.from('m_mupel').select('id_mupel, nama_mupel').order('nama_mupel'),
          supabaseAdmin.from('m_jemaat_induk').select('id_induk, nama_induk').order('nama_induk'),
          supabaseAdmin.from('m_pos_pelkes').select('id_pos, nama_pos').order('nama_pos'),
        ]);

        if (mupelRes.data) {
          mupelRes.data.forEach((m) => {
            const cleanName = m.nama_mupel?.trim() || m.id_mupel;
            const displayName = cleanName.toLowerCase().startsWith('mupel') ? cleanName : `Mupel ${cleanName}`;
            rawList.push({ id_pos: m.id_mupel, nama_pos: displayName, level: 'MUPEL' });
          });
        }
        if (jmtRes.data) {
          jmtRes.data.forEach((j) => {
            const cleanName = j.nama_induk?.trim() || j.id_induk;
            rawList.push({ id_pos: j.id_induk, nama_pos: cleanName, level: 'JEMAAT' });
          });
        }
        if (posRes.data) {
          posRes.data.forEach((p) => {
            const cleanName = p.nama_pos?.trim() || p.id_pos;
            rawList.push({ id_pos: p.id_pos, nama_pos: cleanName, level: 'POS' });
          });
        }
      } else {
        // Scoped User: Fetch specific assignments and downward reach
        if (user.id_induk) {
          const [indukRes, childPosRes] = await Promise.all([
            supabaseAdmin.from('m_jemaat_induk').select('id_induk, nama_induk').eq('id_induk', user.id_induk).maybeSingle(),
            supabaseAdmin.from('m_pos_pelkes').select('id_pos, nama_pos').eq('id_induk', user.id_induk).order('nama_pos'),
          ]);
          if (indukRes.data) {
            rawList.push({ id_pos: indukRes.data.id_induk, nama_pos: indukRes.data.nama_induk, level: 'JEMAAT' });
          }
          if (childPosRes.data) {
            childPosRes.data.forEach((p) => rawList.push({ id_pos: p.id_pos, nama_pos: p.nama_pos, level: 'POS' }));
          }
        }
        if (user.id_pos) {
          const { data: pos } = await supabaseAdmin.from('m_pos_pelkes').select('id_pos, nama_pos').eq('id_pos', user.id_pos).maybeSingle();
          if (pos) rawList.push({ id_pos: pos.id_pos, nama_pos: pos.nama_pos, level: 'POS' });
        }
        if (user.id_mupel) {
          const { data: mupel } = await supabaseAdmin.from('m_mupel').select('id_mupel, nama_mupel').eq('id_mupel', user.id_mupel).maybeSingle();
          if (mupel) {
            const displayName = mupel.nama_mupel.toLowerCase().startsWith('mupel') ? mupel.nama_mupel : `Mupel ${mupel.nama_mupel}`;
            rawList.push({ id_pos: mupel.id_mupel, nama_pos: displayName, level: 'MUPEL' });
          }
        }
      }
    } catch {}
  }

  // 2. Active context guarantee
  const activeLevel: 'MUPEL' | 'JEMAAT' | 'POS' = 
    activeId.startsWith('M -') || activeId.startsWith('MPL-') ? 'MUPEL' :
    activeId.startsWith('ORG-') || activeId.startsWith('JMT-') ? 'JEMAAT' : 'POS';

  rawList.unshift({ id_pos: activeId, nama_pos: `${activeId}`, level: activeLevel });

  // 3. Fallback context options if empty
  if (rawList.length <= 1) {
    rawList.push(
      { id_pos: 'POS-GPIB-ANUGERAH', nama_pos: 'Pos Pelkes Anugerah', level: 'POS' },
      { id_pos: 'ORG-GPIB-JAKARTA', nama_pos: 'GPIB Paulus Jakarta', level: 'JEMAAT' },
      { id_pos: 'M - 01', nama_pos: 'Mupel Banten', level: 'MUPEL' }
    );
  }

  // 4. Strict Deduplication by id_pos
  const uniqueMap = new Map<string, ContextOption>();
  for (const item of rawList) {
    if (item.id_pos && !uniqueMap.has(item.id_pos)) {
      uniqueMap.set(item.id_pos, item);
    }
  }

  return Array.from(uniqueMap.values());
}

export async function switchActiveContextAction(formData: FormData) {
  const contextId = formData.get('contextId') as string;
  if (!contextId) {
    throw new Error('Context ID is required');
  }
  
  return await setWorkingContext(contextId);
}
