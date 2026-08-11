import { redirect } from 'next/navigation';

export default async function LegacyDashboardOrgRedirect({
  params,
}: {
  params: Promise<{ id_org: string }>;
}) {
  const { id_org } = await params;
  redirect(`/org/${encodeURIComponent(id_org)}`);
}
