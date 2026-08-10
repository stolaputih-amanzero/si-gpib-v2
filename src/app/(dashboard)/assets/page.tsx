import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import LaporanAsetPage from '@/app/(dashboard)/laporan/aset/page';

export default async function AssetsCatalogWorkspacePage(props: any) {
  const { context_id, status } = await getServerContext();

  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  // Delegate to the legacy Aset Catalog view
  return <LaporanAsetPage {...props} />;
}
