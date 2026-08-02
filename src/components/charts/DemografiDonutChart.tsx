'use client';

import dynamic from 'next/dynamic';
import { ProfesiFrequency } from '@/lib/utils/demografi-aggregator';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => <div className="h-64 w-full bg-surface-sunken rounded-2xl animate-pulse" /> }
);
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });

export interface DemografiDonutChartProps {
  data: ProfesiFrequency[];
  height?: number;
}

const DONUT_COLORS = ['#1E40AF', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export function DemografiDonutChart({ data, height = 300 }: DemografiDonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center bg-surface-sunken/60 rounded-2xl text-xs text-text-tertiary">
        <span>Belum ada data profesi tercatat</span>
      </div>
    );
  }

  const totalProfesiCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div
      role="img"
      aria-label="Donut chart menunjukkan 5 profesi dominan"
      className="w-full relative select-none"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-surface-elevated border border-border-subtle shadow-xl text-xs space-y-0.5">
                    <p className="font-extrabold text-brand-primary">{item.name}</p>
                    <p className="text-text-high font-bold">{item.count} orang ({item.percentage}%)</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="count"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text Overlay */}
      <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="text-lg font-black text-brand-primary block leading-none">{totalProfesiCount}</span>
        <span className="text-[10px] text-text-tertiary font-bold uppercase">Profesi</span>
      </div>
    </div>
  );
}

export default DemografiDonutChart;
