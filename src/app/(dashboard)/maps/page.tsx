import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import { fetchUnifiedTerritoryData } from '@/lib/services/territory';
import { TerritoryMapClient } from '@/components/maps/TerritoryMapClient';
import { StatusPill } from '@/components/ui/StatusPill';

export const metadata = {
  title: 'Peta & Teritori Pelayanan | SI GPIB',
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
        <p className="text-red-600 font-semibold">Gagal memuat data teritori atau akses ditolak.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-surface-base pb-28 pt-1 sm:pt-3">
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        {/* Open Canvas Hero */}
        <section className="pt-2 sm:pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <StatusPill variant="gold" dot={true}>
              Sinode GPIB
            </StatusPill>
            <StatusPill variant="blue" dot={false}>
              Geospatial Intelligence
            </StatusPill>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-ink-primary tracking-tight leading-[1.15]">
              Peta &amp; Teritori <span className="font-editorial-italic font-normal text-amber-700 dark:text-amber-400">Pelayanan.</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Peta sebaran unit organisasi terpadu, pemetaan kerawanan risiko, dan potensi pertumbuhan wilayah di 25 Mupel.
            </p>
          </div>
        </section>

        {/* Territory Map Container */}
        <section className="rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <TerritoryMapClient points={points} />
        </section>
      </main>
    </div>
  );
}
