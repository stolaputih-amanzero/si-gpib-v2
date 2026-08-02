'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DemografiPelkatData } from '@/hooks/use-analitik';
import { EmptyState } from '@/components/list/EmptyState';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { Users } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-surface-sunken rounded-2xl animate-pulse" /> }
);
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });

export interface DemografiChartProps {
  data: DemografiPelkatData[];
  height?: number;
  idMupel?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-medium text-xs space-y-1.5 min-w-[170px]">
        <p className="font-extrabold text-ink-primary text-sm flex items-center gap-1.5">
          <span>{item.icon || '👥'}</span>
          <span>{item.fullName || label}</span>
          <span className="text-ink-secondary font-semibold text-xs">({item.name || label})</span>
        </p>
        <div className="pt-1.5 border-t border-border-subtle space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-ink-secondary font-medium">Total Jiwa:</span>
            <span className="tabular-nums font-black text-brand-primary text-sm">{item.total} Jiwa</span>
          </div>
          {(item.laki > 0 || item.perempuan > 0) && (
            <div className="text-[11px] flex justify-between gap-2 pt-0.5 font-semibold">
              <span className="text-blue-600 dark:text-blue-400">Laki-Laki: {item.laki}</span>
              <span className="text-pink-600 dark:text-pink-400">Perempuan: {item.perempuan}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function DemografiChart({ data, height = 300, idMupel }: DemografiChartProps) {
  const router = useRouter();

  const formattedData = KATEGORI_PELKAT.map((pelkat) => {
    const found = data?.find((d) => d.kategori?.toUpperCase() === pelkat.kode);
    return {
      name: pelkat.kode,
      fullName: pelkat.nama,
      icon: pelkat.icon,
      warna: pelkat.warna,
      total: found ? found.total : 0,
      laki: found ? found.laki : 0,
      perempuan: found ? found.perempuan : 0,
      kategori: pelkat.kode,
    };
  });

  const isEmpty = !data || data.length === 0 || formattedData.every((d) => d.total === 0);

  if (isEmpty) {
    return (
      <div className="card-flat p-5">
        <div className="flex items-center gap-2 text-ink-primary mb-3">
          <Users className="w-5 h-5 text-brand-primary" />
          <h2 className="text-base font-extrabold font-display">Komposisi Warga Jemaat (Pelkat)</h2>
        </div>
        <EmptyState
          icon={Users}
          title="Belum ada data demografi"
          description="Data demografi pelkat belum tersedia untuk filter yang dipilih."
        />
      </div>
    );
  }

  const handleBarClick = (kategori: string) => {
    router.push(`/demografi?kategori=${kategori}${idMupel ? `&mupel=${idMupel}` : ''}`);
  };

  return (
    <div
      role="img"
      aria-label="Bar chart vertikal menunjukkan komposisi warga jemaat 6 kategori Pelkat"
      className="card-flat p-5 space-y-4 select-none"
    >
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle/50">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-primary" />
          <h2 className="text-lg font-display font-bold text-ink-primary tracking-tightish">Komposisi Warga Jemaat (Pelkat)</h2>
        </div>
        <p className="text-xs text-ink-secondary hidden sm:block font-medium">
          Tap bar untuk filter detail
        </p>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.15)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted, #94a3b8)', fontSize: 12, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted, #94a3b8)', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(128, 128, 128, 0.12)' }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="total"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
              onClick={(entry: any) => handleBarClick(entry.name || entry.payload?.name || entry.kategori)}
              className="cursor-pointer"
            >
              {formattedData.map((item) => (
                <Cell key={item.name} fill={item.warna || '#3B82F6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen Reader Fallback Table */}
      <table className="sr-only">
        <caption>Komposisi Warga Jemaat per Kategori Pelkat</caption>
        <thead>
          <tr>
            <th>Pelkat</th>
            <th>Nama Lengkap</th>
            <th>Laki-Laki</th>
            <th>Perempuan</th>
            <th>Total Jiwa</th>
          </tr>
        </thead>
        <tbody>
          {formattedData.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.fullName}</td>
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
