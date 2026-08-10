import { getServerContext } from '@/lib/utils/context';
import { fetchUnifiedAssetData } from '@/lib/services/asset';
import { notFound, redirect } from 'next/navigation';
import { AssetWorkspaceClient } from '@/components/workspace/asset/AssetWorkspaceClient';

export async function generateMetadata({ params }: { params: Promise<{ id_org: string }> }) {
  const { id_org } = await params;
  return {
    title: `Asset Workspace | ${id_org}`,
  };
}

export default async function AssetWorkspacePage({
  params
}: {
  params: Promise<{ id_org: string }>
}) {
  const context = await getServerContext();
  const contextId = context?.context_id;
  
  if (!context || !contextId) {
    redirect('/auth/login');
  }

  const { id_org } = await params;
  const assetData = await fetchUnifiedAssetData(id_org);

  if (!assetData) {
    notFound();
  }

  return <AssetWorkspaceClient assetData={assetData} contextId={contextId} />;
}
