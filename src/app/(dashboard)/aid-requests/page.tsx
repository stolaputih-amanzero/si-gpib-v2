import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import BantuanPage from '@/app/(dashboard)/bantuan/page';

export default async function AidRequestsWorkspacePage(props: any) {
  const { context_id, status } = await getServerContext();

  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  // Delegate to the legacy Bantuan view
  return <BantuanPage {...props} />;
}
