import { fetchUnifiedPersonData } from '@/lib/services/person';
import { notFound } from 'next/navigation';
import { PersonWorkspaceShell } from '@/components/person/PersonWorkspaceShell';

export const instant = false;

export async function generateMetadata() {
  return {
    title: `Person Workspace | SI GPIB`,
  };
}

export default async function PersonWorkspacePage({
  params
}: {
  params: Promise<{ id_person: string }>
}) {
  const { id_person } = await params;
  const personData = await fetchUnifiedPersonData(id_person);

  if (!personData) {
    notFound();
  }

  return <PersonWorkspaceShell person={personData} />;
}
