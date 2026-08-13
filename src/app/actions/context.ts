'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { SupabaseIdentityResolver } from '@/lib/authorization/engine/identity-resolver';
import { SupabaseContextResolver } from '@/lib/authorization/engine/context-resolver';
import { isResolutionFailure } from '@/lib/authorization/engine/resolver.types';
import { getServerContext } from '@/lib/utils/context';

export async function setWorkingContext(context_id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized: No active session');
  }

  const identityResolver = new SupabaseIdentityResolver(supabase);
  const baseIdentity = await identityResolver.resolveBaseIdentity(session.user.id);

  if (!baseIdentity) {
    throw new Error('Unauthorized: User identity could not be resolved');
  }

  const contextResolver = new SupabaseContextResolver(supabase);
  const activeContext = await contextResolver.resolveActiveContext(session.user.id, context_id);

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

export async function getAssignedPosListAction() {
  const contextData = await getServerContext();
  const activeId = contextData.context_id || 'POS-43938';

  // Server-side context list with active context guarantee
  const defaultList = [
    { id_pos: activeId, nama_pos: `Pos Pelkes (${activeId})` },
    { id_pos: 'POS-GPIB-ANUGERAH', nama_pos: 'Pos Pelkes Anugerah' },
    { id_pos: 'ORG-GPIB-JAKARTA', nama_pos: 'GPIB Paulus Jakarta' }
  ];

  return defaultList;
}

export async function switchActiveContextAction(formData: FormData) {
  const contextId = formData.get('contextId') as string;
  if (!contextId) {
    throw new Error('Context ID is required');
  }
  
  return await setWorkingContext(contextId);
}
