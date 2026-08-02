'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DemografiPelkatData } from '@/hooks/use-analitik';
import { EmptyState } from '@/components/list/EmptyState';
import { Users } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => <div className="w-full h-64 bg-surface-sunken rounded-2xl animate-pulse" /> }
);
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });

export interface DemografiChartProps {
  data: DemografiPelkatData[];
  height?: number;
  idMupel?: string;
}

const BAR_COLORS = ['#1E40AF', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export function DemografiChart({ data, height = 300, idMupel }: DemografiChartProps) {
  const router = useRouter();

  if (!data || data.length === 0 || data.every((d) => d.total === 0)) {
    return (
      <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs">
        <h2 className="text-sm font-extrabold text-text-high mb-3">Distribusi Demografi 6 Pelkat</h2>
        <EmptyState
          icon={Users}
          title="Belum ada data demografi"
          description="Data demografi pelkat belum tersedia untuk filter yang dipilih."
        />
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.total - a.total);

  const handleBarClick = (kategori: string) => {
    router.push(`/demografi?kategori=${kategori}${idMupel ? `&mupel=${idMupel}` : ''}`);
  };

  return (
    <div
      role="img"
      aria-label="Bar chart horizontal menunjukkan distribusi demografi 6 kategori Pelkat"
      className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs space-y-3 select-none"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-text-high">Distribusi Demografi 6 Pelkat</h2>
          <p className="text-[11px] text-text-tertiary">Agregat anggota Pelkat PA, PT, GP, PKP, PKB, PKLU (Tap bar untuk drill-down)</p>
        </div>
      </div>

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
            onClick={(entry: any) => handleBarClick(entry.kategori || entry.payload?.kategori)}
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
        <caption>Distribusi Demografi per Kategori Pelkat</caption>
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Laki-Laki</th>
            <th>Perempuan</th>
            <th>Total Jiwa</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.kategori}>
              <td>{row.kategori}</td>
              <td>{row.laki}</td>
              <td>{row.perempuan}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DemografiChart;
