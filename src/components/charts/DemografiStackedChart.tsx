'use client';

import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => <div className="h-64 w-full bg-surface-sunken rounded-2xl animate-pulse" /> }
);
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });

export interface DemografiStackedChartProps {
  data: Array<{
    kategori: string;
    total: number;
    laki: number;
    perempuan: number;
  }>;
  height?: number;
}

export function DemografiStackedChart({ data, height = 300 }: DemografiStackedChartProps) {
  return (
    <div
      role="img"
      aria-label="Stacked bar chart menunjukkan perbandingan gender laki-laki dan perempuan"
      className="w-full relative select-none"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
          <YAxis
            type="category"
            dataKey="kategori"
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const row = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle shadow-xl text-xs space-y-1">
                    <p className="font-extrabold text-brand-primary">{row.kategori}</p>
                    <p className="text-blue-500 font-bold">Laki-Laki: {row.laki} Jiwa</p>
                    <p className="text-pink-500 font-bold">Perempuan: {row.perempuan} Jiwa</p>
                    <p className="text-text-muted text-[11px] pt-1 border-t border-border-subtle">
                      Total: {row.total} Jiwa
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="laki" name="Laki-Laki" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="perempuan" name="Perempuan" stackId="a" fill="#EC4899" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DemografiStackedChart;
