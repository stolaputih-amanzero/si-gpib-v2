import { JemaatDetailClient } from '@/app/(dashboard)/jemaat/[id_induk]/jemaat-detail-client';

export default async function HierarkiJemaatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id_mupel: string; id_induk: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id_mupel, id_induk } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab || 'profil';

  return (
    <JemaatDetailClient
      id_induk={decodeURIComponent(id_induk)}
      id_mupel={decodeURIComponent(id_mupel)}
      initialTab={activeTab}
    />
  );
}
