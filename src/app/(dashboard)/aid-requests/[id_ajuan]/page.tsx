import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import BantuanDetailPage from '@/app/(dashboard)/bantuan/[id]/page';

export default async function AidRequestDetailWorkspacePage({
  params,
}: {
  params: Promise<{ id_ajuan: string }>;
}) {
  const { context_id, status } = await getServerContext();

  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  const { id_ajuan } = await params;
  
  // Delegate to legacy Bantuan Detail View
  // @ts-ignore: IntrinsicAttributes error from searchParams in Next.js 15
  return <BantuanDetailPage params={Promise.resolve({ id: id_ajuan })} />;
}
