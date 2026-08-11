import { getServerContext } from '@/lib/utils/context';
import { fetchUnifiedAssetData } from '@/lib/services/asset';
import { notFound, redirect } from 'next/navigation';
import { AssetIntelligenceClient } from '@/components/analytics/AssetIntelligenceClient';

export const metadata = {
  title: 'Asset Intelligence | SI GPIB',
};

export default async function AssetIntelligencePage() {
  const context = await getServerContext();
  const contextId = context?.context_id;
  
  if (!context || !contextId || context.status === 'CONTEXT_STALE') {
    redirect('/auth/login');
  }

  // Fetch cross-context intelligence data for the current scope
  const assetData = await fetchUnifiedAssetData(contextId);

  if (!assetData) {
    notFound();
  }

  return <AssetIntelligenceClient assetData={assetData} contextId={contextId} />;
}
