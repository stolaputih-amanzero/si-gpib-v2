import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import PendetaDetailPage from '@/app/(dashboard)/pendeta/[id_pendeta]/page';

export default async function PersonWorkspacePage({
  params,
}: {
  params: Promise<{ id_person: string }>;
}) {
  const { context_id, status } = await getServerContext();

  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  const { id_person } = await params;
  
  // Delegate to legacy Pendeta Detail View
  // @ts-ignore: IntrinsicAttributes error from searchParams in Next.js 15
  return <PendetaDetailPage params={Promise.resolve({ id_pendeta: id_person })} />;
}
