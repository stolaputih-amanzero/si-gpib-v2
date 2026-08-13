import { redirect } from 'next/navigation';
import { getServerContext } from '@/lib/utils/context';

const ROUTE_MAP: Record<string, string> = {
  sdm: '/people',
  aset: '/assets',
  wilayah: '/wilayah',
  pastoral: '/projections/pastoral-dashboard',
  demografi: '/analytics',
  bantuan: '/aid-requests',
};

export default async function OrganisasiSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const context = await getServerContext();
  const contextId = context?.context_id;

  if (slug === 'profil' && contextId) {
    redirect(`/org/${encodeURIComponent(contextId)}`);
  }

  const target = ROUTE_MAP[slug];
  if (target) {
    redirect(target);
  }

  if (contextId) {
    redirect(`/org/${encodeURIComponent(contextId)}`);
  }

  redirect('/org');
}
