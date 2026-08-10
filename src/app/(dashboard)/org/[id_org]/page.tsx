import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import MupelDetailPage from '@/app/(dashboard)/mupel/[id_mupel]/page';
import JemaatDetailPage from '@/app/(dashboard)/jemaat/[id_induk]/page';
import PosPelkesDetailPage from '@/app/(dashboard)/dashboard/pos-pelkes/[id_pos]/page';

export default async function OrganizationWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id_org: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { context_id, status } = await getServerContext();

  // 1. Handle Stale / No Context
  if (status === 'CONTEXT_STALE' || !context_id) {
    redirect('/context-selection');
  }

  const { id_org } = await params;
  const decodedId = decodeURIComponent(id_org);

  // 2. Route to the correct legacy detail view based on ID format.
  // In Phase 6.1c, these will be consolidated into a single unified workspace UI.
  if (decodedId.startsWith('MUPEL-')) {
    return <MupelDetailPage params={Promise.resolve({ id_mupel: decodedId })} searchParams={searchParams} />;
  } else if (decodedId.startsWith('JEMAAT-')) {
    return <JemaatDetailPage params={Promise.resolve({ id_induk: decodedId })} searchParams={searchParams} />;
  } else if (decodedId.startsWith('POS-')) {
    return <PosPelkesDetailPage params={Promise.resolve({ id_pos: decodedId })} searchParams={searchParams} />;
  }

  // Fallback
  return (
    <div className="flex items-center justify-center h-full p-8 text-center">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-destructive">Organisasi Tidak Ditemukan</h2>
        <p className="text-muted-foreground text-sm">
          Format ID organisasi ({decodedId}) tidak dikenali.
        </p>
      </div>
    </div>
  );
}
