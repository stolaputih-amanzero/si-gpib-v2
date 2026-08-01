'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartPieData {
  name: string;
  value: number;
}

interface AsetKondisiChartProps {
  data?: ChartPieData[];
}

const COLORS: Record<string, string> = {
  Baik: '#10B981',         // Emerald Green
  'Rusak Ringan': '#F59E0B', // Amber Gold
  'Rusak Berat': '#EF4444',  // Rose Red
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-elevated p-3 rounded-xl border border-border-subtle shadow-medium text-xs space-y-1 min-w-[140px]">
        <p className="font-extrabold text-text-high text-sm">{label}</p>
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
          <span className="text-text-muted font-medium">Jumlah Aset:</span>
          <span className="tabular-nums font-black text-brand-primary text-sm">{payload[0].value} Unit</span>
        </div>
      </div>
    );
  }
  return null;
};

export function AsetKondisiChart({ data = [] }: AsetKondisiChartProps) {
  return (
    <div className="w-full bg-surface-elevated rounded-2xl p-4 sm:p-5 border border-border-subtle shadow-soft space-y-3">
      <div>
        <h3 className="text-sm font-bold text-text-high">Kondisi Fisik Aset Pos Pelkes</h3>
        <p className="text-xs text-text-muted">Aset Tanah, Bangunan, &amp; Aset Bergerak (Baik, Rusak)</p>
      </div>

      <div className="w-full h-[240px] sm:h-[280px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-text-muted italic">
            Belum ada data kondisi aset
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.15)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted, #94a3b8)', fontSize: 12, fontWeight: 600 }} 
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
              <Bar dataKey="value" name="Jumlah Aset" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
