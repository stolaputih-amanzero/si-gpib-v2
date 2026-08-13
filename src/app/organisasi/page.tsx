import { redirect } from 'next/navigation';
import { getServerContext } from '@/lib/utils/context';
import { fetchUnifiedOrganizationData } from '@/lib/services/organization';
import { OrganizationWorkspaceShell } from '@/components/org/OrganizationWorkspaceShell';

export default async function OrganisasiPage() {
  const context = await getServerContext();
  
  if (context.status === 'VALID' && context.context_id) {
    const organizationData = await fetchUnifiedOrganizationData(context.context_id);
    if (organizationData) {
      return <OrganizationWorkspaceShell organization={organizationData} />;
    }
  }

  redirect('/org');
}

