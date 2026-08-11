import { redirect } from 'next/navigation';

export default async function LegacyMupelRedirect({
  params,
}: {
  params: Promise<{ id_mupel: string }>;
}) {
  const { id_mupel } = await params;
  redirect(`/org/${encodeURIComponent(id_mupel)}`);
}
