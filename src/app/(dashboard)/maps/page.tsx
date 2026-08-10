import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import PetaSebaranPage from '@/app/(dashboard)/dashboard/peta/page';

export default async function MapsWorkspacePage(props: any) {
  const { context_id, status } = await getServerContext();

  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  // Delegate to the legacy Peta Sebaran view
  return <PetaSebaranPage {...props} />;
}
