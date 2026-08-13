import { fetchUnifiedOrganizationData } from '@/lib/services/organization';
import { notFound } from 'next/navigation';
import { OrganizationWorkspaceShell } from '@/components/org/OrganizationWorkspaceShell';

export const instant = false;

export async function generateMetadata() {
  return {
    title: `Organization Workspace | SI GPIB`,
  };
}

export default async function OrganizationWorkspacePage({
  params
}: {
  params: Promise<{ id_org: string }>
}) {
  const { id_org } = await params;
  const organizationData = await fetchUnifiedOrganizationData(id_org);

  if (!organizationData) {
    notFound();
  }

  return <OrganizationWorkspaceShell organization={organizationData} />;
}
