'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';

interface DemografiChartProps {
  data: Array<{
    kategori_pelkat: string;
    laki: number;
    perempuan: number;
  }>;
}

export function DemografiChartInner({ data }: DemografiChartProps) {
  const chartData = KATEGORI_PELKAT.map((pelkat) => {
    const found = data.find((d) => d.kategori_pelkat === pelkat.kode);
    return {
      nama: pelkat.kode,
      fullNama: pelkat.nama,
      icon: pelkat.icon,
      laki: found ? found.laki : 0,
      perempuan: found ? found.perempuan : 0,
      total: found ? found.laki + found.perempuan : 0,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-elevated p-3 rounded-lg shadow-float border border-border-subtle text-xs space-y-1.5 min-w-[140px]">
          <p className="font-bold text-text-high text-sm flex items-center gap-1">
            <span>{data.icon}</span> {data.fullNama} ({data.nama})
          </p>
          <div className="border-t border-border-subtle pt-1 space-y-1">
            <div className="flex justify-between text-blue-600 font-medium">
              <span>Laki-Laki:</span>
              <span className="tabular-nums font-bold">{data.laki}</span>
            </div>
            <div className="flex justify-between text-pink-600 font-medium">
              <span>Perempuan:</span>
              <span className="tabular-nums font-bold">{data.perempuan}</span>
            </div>
            <div className="flex justify-between text-brand-primary font-bold pt-1 border-t border-border-subtle">
              <span>Total Jiwa:</span>
              <span className="tabular-nums">{data.total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[260px] md:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="nama" 
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Bar dataKey="laki" fill="#3B82F6" name="Laki-Laki" radius={[4, 4, 0, 0]} />
          <Bar dataKey="perempuan" fill="#EC4899" name="Perempuan" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
