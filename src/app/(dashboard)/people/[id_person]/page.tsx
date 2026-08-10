import { getServerContext } from '@/lib/utils/context';
import { fetchUnifiedPersonData } from '@/lib/services/person';
import { notFound, redirect } from 'next/navigation';
import { PersonWorkspaceClient } from '@/components/workspace/person/PersonWorkspaceClient';

export async function generateMetadata() {
  // To avoid duplicate fetches, this would ideally be cached by React, but for simplicity we rely on the component fetch
  return {
    title: `Person Workspace | SI GPIB`,
  };
}

export default async function PersonWorkspacePage({
  params
}: {
  params: Promise<{ id_person: string }>
}) {
  const context = await getServerContext();
  const contextId = context?.context_id;
  
  if (!context || !contextId) {
    redirect('/auth/login');
  }

  const { id_person } = await params;
  const personData = await fetchUnifiedPersonData(id_person);

  if (!personData) {
    // Either doesn't exist, or user lacks Downward Reach RBAC
    notFound();
  }

  return <PersonWorkspaceClient personData={personData} />;
}
