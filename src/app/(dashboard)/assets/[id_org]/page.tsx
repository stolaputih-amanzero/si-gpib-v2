import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import AsetDetailPage from '@/app/(dashboard)/aset/[id_pos]/page';

export default async function AssetOrgWorkspacePage({
  params,
}: {
  params: Promise<{ id_org: string }>;
}) {
  const { context_id, status } = await getServerContext();

  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  const { id_org } = await params;
  
  // Delegate to legacy Aset Detail View
  // In the legacy system, id_pos was the parameter used for assets.
  // @ts-ignore: IntrinsicAttributes error from searchParams in Next.js 15
  return <AsetDetailPage params={Promise.resolve({ id_pos: id_org })} />;
}
