import { fetchUnifiedAidRequestData } from '@/lib/services/aidRequest';
import { notFound } from 'next/navigation';
import { AidRequestWorkspaceShell } from '@/components/aid-request/AidRequestWorkspaceShell';

export async function generateMetadata() {
  return {
    title: `Aid Request Detail View | SI GPIB`,
  };
}

export default async function AidRequestDetailPage({
  params
}: {
  params: Promise<{ id_ajuan: string }>
}) {
  const { id_ajuan } = await params;
  const aidData = await fetchUnifiedAidRequestData(id_ajuan);

  if (!aidData) {
    notFound();
  }

  return <AidRequestWorkspaceShell initialData={aidData} />;
}
