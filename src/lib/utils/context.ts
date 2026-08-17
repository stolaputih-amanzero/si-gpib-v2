import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function getServerContext() {
  const cookieStore = await cookies();
  const contextIdCookie = cookieStore.get('sigpib_active_context')?.value;

  let user: any = null;

  // 1. Fast local session cookie first (0ms latency, eliminates blocking Supabase network call)
  const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie);
    } catch {}
  }

  // 2. Fallback to Supabase Auth session only if no local session cookie
  if (!user) {
    try {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user || null;
    } catch {}
  }

  if (!user) {
    return { status: 'UNAUTHORIZED', context_id: null, user: null };
  }

  const role = (user.role || user.user_metadata?.role || '').toLowerCase();
  const isSuperUser = role === 'super_user' || role === 'admin' || role === 'superadmin' || user.email === 'stolaputih@gmail.com';

  if (isSuperUser && user.email === 'stolaputih@gmail.com') {
    user.id_person = null;
    user.id_pendeta = null;
  }

  const resolvedContextId = 
    (!isSuperUser ? contextIdCookie : null) || 
    user.id_pos || 
    user.user_metadata?.id_pos || 
    user.id_induk || 
    user.user_metadata?.id_induk || 
    user.id_mupel || 
    user.user_metadata?.id_mupel || 
    null;

  return { status: 'VALID', context_id: resolvedContextId, user };
}
