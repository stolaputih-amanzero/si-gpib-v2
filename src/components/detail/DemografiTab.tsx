'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { ListRow } from '@/components/list/ListRow';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { Users, Home, User } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface DemografiTabProps {
  id_pos: string;
  canWrite?: boolean;
}

export function DemografiTab({ id_pos }: DemografiTabProps) {
  const { data: demografi, isLoading } = useQuery({
    queryKey: ['pos-demografi', id_pos],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('t_demografi_pelkat')
        .select('*')
        .eq('id_pos', id_pos);
      return data || [];
    },
  });

  if (isLoading) {
    return <ListSkeleton count={4} />;
  }

  const demoKK = demografi?.reduce((acc: number, curr: any) => acc + (curr.jml_kk || 0), 0) || 0;
  const demoLaki = demografi?.reduce((acc: number, curr: any) => acc + (curr.laki || 0), 0) || 0;
  const demoPerempuan = demografi?.reduce((acc: number, curr: any) => acc + (curr.perempuan || 0), 0) || 0;
  const demoJiwa = demoLaki + demoPerempuan;

  // Prepare horizontal bar chart data ordered by SSoT Pelkat order
  const chartData = KATEGORI_PELKAT.map((pelkat) => {
    const found = demografi?.find((d: any) => d.kategori_pelkat === pelkat.kode);
    const laki = found ? Number(found.laki || 0) : 0;
    const perempuan = found ? Number(found.perempuan || 0) : 0;
    const total = laki + perempuan;

    return {
      kode: pelkat.kode,
      nama: pelkat.nama,
      icon: pelkat.icon,
      laki,
      perempuan,
      total,
      hex: pelkat.warna,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-elevated p-3.5 rounded-xl shadow-medium border border-border-subtle text-xs space-y-2 min-w-[160px]">
          <p className="font-extrabold text-text-high text-sm flex items-center gap-1.5">
            <span>{data.icon}</span>
            <span>{data.nama} ({data.kode})</span>
          </p>
          <div className="border-t border-border-subtle pt-1.5 space-y-1">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold">
              <span>Laki-Laki:</span>
              <span className="tabular-nums font-extrabold">{data.laki} Jiwa</span>
            </div>
            <div className="flex items-center justify-between text-pink-600 dark:text-pink-400 font-semibold">
              <span>Perempuan:</span>
              <span className="tabular-nums font-extrabold">{data.perempuan} Jiwa</span>
            </div>
            <div className="flex items-center justify-between text-text-high font-extrabold pt-1.5 border-t border-border-subtle">
              <span>Total Pelkat:</span>
              <span className="tabular-nums font-black" style={{ color: data.hex }}>{data.total} Jiwa</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Summary Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total KK Terdaftar', value: demoKK, icon: <Home size={16} className="text-emerald-600 dark:text-emerald-400" /> },
          { label: 'Total Jiwa', value: demoJiwa, icon: <Users size={16} className="text-brand-primary" /> },
          { label: 'Laki-Laki', value: demoLaki, icon: <User size={16} className="text-blue-600 dark:text-blue-400" /> },
          { label: 'Perempuan', value: demoPerempuan, icon: <User size={16} className="text-pink-600 dark:text-pink-400" /> },
        ]}
        className="bg-surface-1/50 rounded-xl py-2 px-3 hairline-b"
      />

      {/* Horizontal Recharts Bar Chart */}
      <div className="bg-surface-1 p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-text-high flex items-center gap-2">
          <Users size={16} className="text-brand-primary" />
          <span>Grafik Distribusi Pelkat (Horizontal Bar Chart)</span>
        </h3>

        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128, 128, 128, 0.15)" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted, #94a3b8)' }}
              />
              <YAxis
                type="category"
                dataKey="kode"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--text-high, #f8fafc)', fontWeight: 700 }}
                width={50}
              />
              <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.12)' }} content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={22}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown List using ListRow */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">
          Rincian Per Kategori Pelkat
        </h3>

        <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden shadow-xs">
          {chartData.map((item) => {
            return (
              <ListRow
                key={item.kode}
                icon={<span className="text-base">{item.icon}</span>}
                iconVariant="none"
                title={`${item.nama} (${item.kode})`}
                subtitle={
                  <span className="flex items-center gap-3 text-xs">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">L: {item.laki}</span>
                    <span className="text-pink-600 dark:text-pink-400 font-semibold">P: {item.perempuan}</span>
                  </span>
                }
                badge={
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-black tabular-nums"
                    style={{ backgroundColor: `${item.hex}18`, color: item.hex }}
                  >
                    {item.total} Jiwa
                  </span>
                }
                href="/laporan/demografi"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DemografiTab;
