import { JemaatDetailClient } from './jemaat-detail-client';

export default async function JemaatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id_induk: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id_induk } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab || 'profil';

  return (
    <JemaatDetailClient
      id_induk={decodeURIComponent(id_induk)}
      initialTab={activeTab}
    />
  );
}
