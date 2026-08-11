import { redirect } from 'next/navigation';

export default async function LegacyDashboardAidRequestRedirect({
  params,
}: {
  params: Promise<{ id_ajuan: string }>;
}) {
  const { id_ajuan } = await params;
  redirect(`/aid-requests/${encodeURIComponent(id_ajuan)}`);
}
