import { getServerContext } from '@/lib/utils/context';
import { fetchUnifiedAidRequestData } from '@/lib/services/aid-request';
import { notFound, redirect } from 'next/navigation';
import { AidRequestDetailClient } from '@/components/bantuan/AidRequestDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ id_ajuan: string }> }) {
  const { id_ajuan } = await params;
  return {
    title: `Aid Request | ${id_ajuan}`,
  };
}

export default async function AidRequestWorkspacePage({
  params
}: {
  params: Promise<{ id_ajuan: string }>
}) {
  const context = await getServerContext();
  const contextId = context?.context_id;
  
  if (!context || !contextId) {
    redirect('/auth/login');
  }

  const { id_ajuan } = await params;
  const aidData = await fetchUnifiedAidRequestData(id_ajuan);

  // Secure RBAC: fetchUnifiedAidRequestData returns null if context lacks permission
  if (!aidData) {
    notFound();
  }

  return <AidRequestDetailClient data={aidData} contextId={contextId} />;
}
