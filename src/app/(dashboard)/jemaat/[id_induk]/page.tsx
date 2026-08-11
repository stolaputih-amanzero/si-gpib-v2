import { redirect } from 'next/navigation';

export default async function LegacyJemaatRedirect({
  params,
}: {
  params: Promise<{ id_induk: string }>;
}) {
  const { id_induk } = await params;
  redirect(`/org/${encodeURIComponent(id_induk)}`);
}
