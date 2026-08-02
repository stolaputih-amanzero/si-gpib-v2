import { MupelDetailClient } from '@/app/(dashboard)/mupel/[id_mupel]/mupel-detail-client';

export default async function HierarkiMupelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id_mupel: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id_mupel } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab || 'profil';

  return (
    <MupelDetailClient
      id_mupel={decodeURIComponent(id_mupel)}
      initialTab={activeTab}
    />
  );
}
