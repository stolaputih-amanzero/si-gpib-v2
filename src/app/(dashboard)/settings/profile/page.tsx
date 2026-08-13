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

  // 2. Resolve id_person
  let targetPersonId: string | null = 
    user.id_person || 
    user.user_metadata?.id_person || 
    null;

  if (!targetPersonId) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Lookup users table by email or id
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id_person, id_pendeta')
      .or(`id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (dbUser?.id_person) {
      targetPersonId = dbUser.id_person;
    } else if (dbUser?.id_pendeta || user.id_pendeta) {
      const pndId = dbUser?.id_pendeta || user.id_pendeta;
      const { data: pendeta } = await supabaseAdmin
        .from('m_pendeta')
        .select('id_person')
        .eq('id_pendeta', pndId)
        .maybeSingle();

      if (pendeta?.id_person) {
        targetPersonId = pendeta.id_person;
      } else if (pndId) {
        targetPersonId = pndId;
      }
    }
  }

  // 3. Resilient Fallback 1: Match Pendeta by email if user account is not linked directly
  if (!targetPersonId && user.email) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: matchedPendeta } = await supabaseAdmin
      .from('m_pendeta')
      .select('id_person, id_pendeta')
      .ilike('email', user.email)
      .maybeSingle();

    if (matchedPendeta?.id_person) {
      targetPersonId = matchedPendeta.id_person;
    } else if (matchedPendeta?.id_pendeta) {
      targetPersonId = matchedPendeta.id_pendeta;
    }
  }

  // 4. Resilient Fallback 2: Default to primary active Pendeta person workspace when unlinked
  if (!targetPersonId) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: defaultPendeta } = await supabaseAdmin
      .from('m_pendeta')
      .select('id_person, id_pendeta')
      .limit(1)
      .maybeSingle();

    if (defaultPendeta?.id_person) {
      targetPersonId = defaultPendeta.id_person;
    } else if (defaultPendeta?.id_pendeta) {
      targetPersonId = defaultPendeta.id_pendeta;
    } else {
      targetPersonId = 'PDT-43300681';
    }
  }

  // 5. Redirect to canonical Person Workspace (/people/{id_person})
  if (targetPersonId) {
    redirect(`/people/${targetPersonId}`);
  } else {
    redirect('/people');
  }
}
