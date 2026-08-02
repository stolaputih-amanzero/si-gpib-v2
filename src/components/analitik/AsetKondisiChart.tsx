'use client';

import dynamic from 'next/dynamic';
import { ChartPieData } from '@/hooks/use-analitik';
import { EmptyState } from '@/components/list/EmptyState';
import { Box } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => <div className="w-full h-64 bg-surface-sunken rounded-2xl animate-pulse" /> }
);
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });

export interface AsetKondisiChartProps {
  data: ChartPieData[];
  height?: number;
}

const KONDISI_COLORS: Record<string, string> = {
  Baik: '#10B981',
  'Rusak Ringan': '#F59E0B',
  'Rusak Berat': '#EF4444',
};

export function AsetKondisiChart({ data, height = 280 }: AsetKondisiChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs">
        <h2 className="text-sm font-extrabold text-text-high mb-3">Kondisi Fisik Aset Pos</h2>
        <EmptyState
          icon={Box}
          title="Belum ada data aset"
          description="Tidak ada data kondisi aset untuk filter yang dipilih."
        />
      </div>
    );
  }

  const totalAset = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      role="img"
      aria-label="Pie chart menunjukkan distribusi kondisi fisik aset pos"
      className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs space-y-3 relative select-none"
    >
      <div>
        <h2 className="text-sm font-extrabold text-text-high">Distribusi Kondisi Fisik Aset Pos</h2>
        <p className="text-[11px] text-text-tertiary">Persentase kondisi Baik, Rusak Ringan, Rusak Berat</p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle shadow-xl text-xs space-y-0.5">
                      <p className="font-extrabold text-brand-primary">{item.name}</p>
                      <p className="text-text-high font-bold">{item.value} item aset</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Pie
              data={data}
              cx="50%"
              cy="42%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={KONDISI_COLORS[entry.name] || '#3B82F6'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Overlay */}
        <div className="absolute top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-lg font-black text-brand-primary block leading-none">{totalAset}</span>
          <span className="text-[10px] text-text-tertiary font-bold uppercase">Aset</span>
        </div>
      </div>

      {/* Screen Reader Fallback Table */}
      <table className="sr-only">
        <caption>Kondisi Fisik Aset Pos</caption>
        <thead>
          <tr>
            <th>Kondisi</th>
            <th>Jumlah Item</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AsetKondisiChart;
