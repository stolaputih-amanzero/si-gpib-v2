import { redirect } from 'next/navigation';
import { getServerContext } from '@/lib/utils/context';
import { createClient as createAdminClient } from '@supabase/supabase-js';

/**
 * F2 Person Workspace Self Profile Shortcut (/settings/profile)
 * Resolves authenticated user identity and redirects to canonical /people/{id_person} workspace.
 */
export default async function SettingsProfileShortcutPage() {
  // 1. Resolve authenticated identity (supporting both Supabase Auth session & DB cookie session)
  const context = await getServerContext();

  if (!context || context.status === 'UNAUTHORIZED' || !context.user) {
    redirect('/login');
  }

  const user = context.user;

  // 2. Query the real user record from database to avoid stale cookie session contamination
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let targetPersonId: string | null = null;

  // Lookup database users table by id or email
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

  // 3. Match Pendeta by email if user account email matches m_pendeta directly
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

  // 3. If targetPersonId is found, redirect to personal workspace (/people/{id_person})
  if (targetPersonId) {
    redirect(`/people/${targetPersonId}`);
  } else {
    // Non-pastoral admin / unlinked account -> Redirect to /people (Direktori SDM Pelayan)
    redirect('/people');
  }
}
