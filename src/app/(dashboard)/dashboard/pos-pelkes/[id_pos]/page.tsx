import { redirect } from 'next/navigation';

export default async function LegacyPosPelkesRedirect({
  params,
}: {
  params: Promise<{ id_pos: string }>;
}) {
  const { id_pos } = await params;
  redirect(`/org/${encodeURIComponent(id_pos)}`);
}
