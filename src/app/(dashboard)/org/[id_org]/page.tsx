import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import { fetchUnifiedOrganizationData, hasReadAccess } from '@/lib/services/organization';
import { OrganizationWorkspaceClient } from '@/components/workspace/org/OrganizationWorkspaceClient';

export default async function OrganizationWorkspacePage({
  params,
}: {
  params: Promise<{ id_org: string }>;
}) {
  const { context_id, status } = await getServerContext();

  // 1. Handle Stale / No Context
  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  const { id_org } = await params;
  const decodedId = decodeURIComponent(id_org);

  // 2. Fetch Unified Data
  const orgData = await fetchUnifiedOrganizationData(decodedId);

  if (!orgData) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-destructive">Organisasi Tidak Ditemukan</h2>
          <p className="text-muted-foreground text-sm">
            Format ID organisasi ({decodedId}) tidak dikenali atau telah dihapus.
          </p>
        </div>
      </div>
    );
  }

  // 3. View Target Validation (RBAC Downward & Upward Reach)
  const canRead = await hasReadAccess(context_id, decodedId);
  if (!canRead) {
    redirect(`/org/${encodeURIComponent(context_id)}`);
  }

  // Generate a mock activeContext for the client since we can't extract it from getServerContext right now
  // In reality activeContext has more details, but the client only relies on `id` and maybe `name` for FAB lock
  const clientActiveContext = { id: context_id, name: 'Context', context_level: 'UNKNOWN' };

  return <OrganizationWorkspaceClient orgData={orgData} activeContext={clientActiveContext} />;
}
