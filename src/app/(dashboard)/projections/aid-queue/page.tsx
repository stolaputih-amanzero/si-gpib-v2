import { getAidQueueProjectionData } from '@/lib/domains/aid-requests/aid-queue.queries';
import { AidQueueClientView } from './AidQueueClientView';

export default async function AidQueueProjectionPage() {
  // T-1: Server-side authorization & scope resolution
  const projectionData = await getAidQueueProjectionData();

  return <AidQueueClientView data={projectionData} />;
}
