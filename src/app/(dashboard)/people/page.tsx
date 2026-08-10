import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import SdmPendetaPage from '@/app/(dashboard)/sdm/pendeta/page';

export default async function PeopleCatalogWorkspacePage(props: any) {
  const { context_id, status } = await getServerContext();

  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  // Delegate to the legacy Pendeta Catalog view
  return <SdmPendetaPage {...props} />;
}
