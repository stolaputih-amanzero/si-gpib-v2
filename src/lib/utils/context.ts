import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function getServerContext() {
  const cookieStore = await cookies();
  const contextIdCookie = cookieStore.get('sigpib_active_context')?.value;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  let user: any = session?.user || null;

  if (!user) {
    const sessionCookie = cookieStore.get('si_gpib_user_session')?.value;
    if (sessionCookie) {
      try {
        user = JSON.parse(sessionCookie);
      } catch {}
    }
  }

  if (!user) {
    return { status: 'UNAUTHORIZED', context_id: null, user: null };
  }

  const resolvedContextId = 
    contextIdCookie || 
    user.id_pos || 
    user.user_metadata?.id_pos || 
    user.id_induk || 
    user.user_metadata?.id_induk || 
    user.id_mupel || 
    user.user_metadata?.id_mupel || 
    'POS-43938';

  return { status: 'VALID', context_id: resolvedContextId, user };
}
