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
  Baik: '#22C55E',           // Hijau Muda (matching PA color)
  'Rusak Ringan': '#EAB308', // Kuning (matching PT color)
  'Rusak Berat': '#EF4444',  // Red
};

export function AsetKondisiChart({ data, height = 280 }: AsetKondisiChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="card-flat p-5">
        <h2 className="text-base font-display font-bold text-ink-primary mb-3">Kondisi Fisik Aset Pos</h2>
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
      className="card-flat p-5 space-y-3 relative select-none"
    >
      <div className="pb-2.5 border-b border-border-subtle/50">
        <h2 className="text-base font-display font-bold text-ink-primary tracking-tightish">Distribusi Kondisi Fisik Aset Pos</h2>
        <p className="text-xs text-ink-secondary font-medium">Persentase kondisi Baik, Rusak Ringan, Rusak Berat</p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-medium text-xs space-y-1 select-none z-50">
                      <p className="font-extrabold text-ink-primary text-sm">{item.name}</p>
                      <p className="text-brand-primary font-bold text-sm">{item.value} item aset</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(value) => <span className="text-ink-primary text-xs font-bold px-1">{value}</span>}
            />
            <Pie
              data={data}
              cx="50%"
              cy="40%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              stroke="var(--surface-1)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={KONDISI_COLORS[entry.name] || '#3B82F6'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Overlay */}
        <div className="absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-2xl font-black font-display tnum text-ink-primary block leading-none">{totalAset}</span>
          <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">Aset</span>
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
