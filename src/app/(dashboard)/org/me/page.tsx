import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveWorkspaceTarget } from '@/lib/services/workspace-target-resolver';

export default async function OrgMePage() {
  const supabase = await createClient();

  // 1. Resolve authenticated identity
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Missing session -> Redirect to /login
  if (!user) {
    redirect('/login');
  }

  // 3. Resolve workspace target using audited resolver
  const result = await resolveWorkspaceTarget({
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role || user.role,
    id_mupel: user.user_metadata?.id_mupel,
    id_induk: user.user_metadata?.id_induk,
    id_pos: user.user_metadata?.id_pos,
  });

  // 4. Redirect to resolved canonical target route
  redirect(result.targetUrl);
}
