import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import { fetchUnifiedTerritoryData } from '@/lib/services/territory';
import { TerritoryMapClient } from '@/components/maps/TerritoryMapClient';

export const metadata = {
  title: 'Territory Intelligence | SI GPIB',
};

export default async function MapsPage() {
  const context = await getServerContext();

  if (!context || context.status === 'UNAUTHORIZED') {
    redirect('/login');
  }

  const points = await fetchUnifiedTerritoryData();

  if (!points) {
    return (
      <div className="p-8 text-center">
        <p className="text-state-error font-semibold">Gagal memuat data teritori atau akses ditolak.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-base pb-32">
      {/* Header */}
      <header className="bg-surface-elevated border-b border-border-subtle pt-12 pb-6 px-4 sticky top-0 z-20">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-text-high leading-tight">
            Territory Intelligence
          </h1>
          <p className="text-sm text-text-muted">
            Peta sebaran organisasi, risiko kerawanan, dan potensi wilayah
          </p>
        </div>
      </header>

      <main className="flex-1 p-4">
        <TerritoryMapClient points={points} />
      </main>
    </div>
  );
}
