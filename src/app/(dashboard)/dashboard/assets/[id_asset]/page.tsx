import { redirect } from 'next/navigation';

export default async function LegacyDashboardAssetRedirect({
  params,
}: {
  params: Promise<{ id_asset: string }>;
}) {
  const { id_asset } = await params;
  redirect(`/assets/${encodeURIComponent(id_asset)}`);
}
