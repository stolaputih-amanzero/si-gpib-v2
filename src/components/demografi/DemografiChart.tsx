'use client';

import dynamic from 'next/dynamic';

const DemografiChartInner = dynamic(
  () => import('./DemografiChartInner').then(mod => mod.DemografiChartInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] md:h-[340px] flex items-center justify-center bg-surface-sunken/40 rounded-xl animate-pulse">
        <p className="text-xs text-text-muted font-medium">Memuat grafik demografi...</p>
      </div>
    ),
  }
);

interface DemografiChartProps {
  data: Array<{
    kategori_pelkat: string;
    laki: number;
    perempuan: number;
  }>;
}

export function DemografiChart({ data }: DemografiChartProps) {
  return <DemografiChartInner data={data} />;
}
