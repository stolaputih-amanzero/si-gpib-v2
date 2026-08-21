import { redirect } from 'next/navigation';
import { getServerContext } from '@/lib/utils/context';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { isSuperUserRole } from '@/hooks/use-current-user';
import { AdminAccountProfileView } from '@/components/profile/AdminAccountProfileView';

/**
 * F2 Settings Profile Router (/settings/profile)
 * - Super User & Admin: Instant 0ms render of fluid AdminAccountProfileView without server waterfalls.
 * - Pastoral / Field Workers (Pendeta, Presbiter): Redirects to canonical /people/{id_person} workspace.
 */
export default async function SettingsProfilePage() {
  // 1. Resolve authenticated identity directly from cookie/JWT session
  const context = await getServerContext();

  if (!context || context.status === 'UNAUTHORIZED' || !context.user) {
    redirect('/login');
  }

  const user = context.user;

  // 2. Fast-Path: If user is Super User or Admin, render immediately without blocking on DB lookups
  if (isSuperUserRole(user.role, user.email)) {
    return <AdminAccountProfileView />;
  }

  // 3. For field ministers/pastoral roles, resolve targetPersonId
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let targetPersonId: string | null = null;

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('id, email, role, id_person, id_pendeta')
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  if (dbUser?.id_person) {
    targetPersonId = dbUser.id_person;
  } else if (dbUser?.id_pendeta) {
    const { data: pendeta } = await supabaseAdmin
      .from('m_pendeta')
      .select('id_person, id_pendeta')
      .eq('id_pendeta', dbUser.id_pendeta)
      .maybeSingle();

    targetPersonId = pendeta?.id_person || pendeta?.id_pendeta || dbUser.id_pendeta;
  }

  // Match Pendeta by email if unlinked
  if (!targetPersonId && (user.email || dbUser?.email)) {
    const emailToMatch = dbUser?.email || user.email;
    const { data: matchedPendeta } = await supabaseAdmin
      .from('m_pendeta')
      .select('id_person, id_pendeta')
      .ilike('email', emailToMatch)
      .maybeSingle();

    if (matchedPendeta?.id_person) {
      targetPersonId = matchedPendeta.id_person;
    } else if (matchedPendeta?.id_pendeta) {
      targetPersonId = matchedPendeta.id_pendeta;
    }
  }

  if (targetPersonId) {
    redirect(`/people/${targetPersonId}`);
  } else {
    // If not found in pastoral table and not superuser, render AdminAccountProfileView as generic account view
    return <AdminAccountProfileView />;
  }
}
