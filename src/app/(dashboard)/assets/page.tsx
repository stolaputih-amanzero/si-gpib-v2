import { getServerContext } from '@/lib/utils/context';
import { fetchUnifiedAssetData } from '@/lib/services/asset';
import { notFound, redirect } from 'next/navigation';
import { AssetIntelligenceClient } from '@/components/analytics/AssetIntelligenceClient';

export const metadata = {
  title: 'Asset Intelligence | SI GPIB',
};

export const instant = false;

export default async function AssetIntelligencePage() {
  const context = await getServerContext();
  const contextId = context?.context_id;
  
  if (!context || context.status === 'UNAUTHORIZED') {
    redirect('/login');
  }

  // Fetch cross-context intelligence data for the current scope
  const assetData = await fetchUnifiedAssetData(contextId);

  if (!assetData) {
    notFound();
  }

  return <AssetIntelligenceClient assetData={assetData} contextId={contextId} />;
}
