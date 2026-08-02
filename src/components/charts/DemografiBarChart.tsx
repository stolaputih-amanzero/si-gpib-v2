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
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });

export interface DemografiBarChartProps {
  data: Array<{
    kategori: string;
    total: number;
    laki: number;
    perempuan: number;
  }>;
  onBarClick?: (kategori: string) => void;
  height?: number;
}

const BAR_COLORS = ['#1E40AF', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export function DemografiBarChart({ data, onBarClick, height = 320 }: DemografiBarChartProps) {
  const sortedData = [...(data || [])].sort((a, b) => b.total - a.total);

  return (
    <div
      role="img"
      aria-label="Bar chart horizontal menunjukkan jumlah jiwa per kategori pelkat"
      className="w-full relative select-none"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={sortedData}
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
                    <p className="text-text-high font-semibold">Total: {row.total} Jiwa</p>
                    <div className="text-[11px] text-text-tertiary flex gap-2">
                      <span className="text-blue-500">Laki: {row.laki}</span>
                      <span className="text-pink-500">Pr: {row.perempuan}</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="total"
            radius={[0, 8, 8, 0]}
            onClick={(entry: any) => onBarClick && onBarClick(entry.kategori || entry.payload?.kategori)}
            className="cursor-pointer"
          >
            {sortedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Screen Reader Fallback Table */}
      <table className="sr-only">
        <caption>Jumlah Jiwa per Kategori Pelkat</caption>
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Total Jiwa</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.kategori}>
              <td>{row.kategori}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DemografiBarChart;
