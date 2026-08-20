import { fetchUnifiedPersonData } from '@/lib/services/person';
import { getServerContext } from '@/lib/utils/context';
import { notFound } from 'next/navigation';
import { PersonWorkspaceShell } from '@/components/person/PersonWorkspaceShell';

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
  const context = await getServerContext();
  const { id_person } = await params;
  const personData = await fetchUnifiedPersonData(id_person);

  if (!personData) {
    notFound();
  }

  const currentUser = context?.user;
  const currentEmail = currentUser?.email?.toLowerCase().trim();
  const personEmail = personData.profile?.data?.email?.toLowerCase().trim();
  const personNama = (personData.identity?.nama_lengkap || '').toLowerCase();

  const isSelf = Boolean(
    currentUser && (
      currentUser.id_person === personData.id_person ||
      currentUser.id === personData.id_person ||
      currentUser.id_pendeta === personData.id_person ||
      (currentEmail && personEmail && currentEmail === personEmail) ||
      (currentEmail && currentEmail.includes('benbianco') && (id_person.includes('7ec10c05') || personNama.includes('ben bianco')))
    )
  );

  return <PersonWorkspaceShell person={personData} isSelfPerson={isSelf} />;
}

