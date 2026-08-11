import { redirect } from 'next/navigation';
import { getServerContext } from '@/lib/utils/context';
import { resolveWorkspaceTarget } from '@/lib/services/workspace-target-resolver';

export default async function OrgMePage() {
  // 1. Resolve authenticated identity (supporting both Supabase Auth session & DB cookie session)
  const context = await getServerContext();

  // 2. Missing session -> Redirect to /login
  if (!context || context.status === 'UNAUTHORIZED' || !context.user) {
    redirect('/login');
  }

  const user = context.user;

  // 3. Resolve workspace target using audited resolver
  const result = await resolveWorkspaceTarget({
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role || user.role,
    id_mupel: user.user_metadata?.id_mupel || user.id_mupel,
    id_induk: user.user_metadata?.id_induk || user.id_induk,
    id_pos: user.user_metadata?.id_pos || user.id_pos,
  });

  // 4. Redirect to resolved canonical target route
  redirect(result.targetUrl);
}
