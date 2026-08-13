import { fetchUnifiedAssetData } from '@/lib/services/asset';
import { notFound } from 'next/navigation';
import { AssetWorkspaceShell } from '@/components/asset/AssetWorkspaceShell';

export async function generateMetadata() {
  return {
    title: `Asset Detail View | SI GPIB`,
  };
}

export const instant = false;

export default async function AssetDetailPage({
  params
}: {
  params: Promise<{ id_asset: string }>
}) {
  const { id_asset } = await params;
  const assetData = await fetchUnifiedAssetData(id_asset);

  if (!assetData) {
    notFound();
  }

  return <AssetWorkspaceShell asset={assetData} />;
}
