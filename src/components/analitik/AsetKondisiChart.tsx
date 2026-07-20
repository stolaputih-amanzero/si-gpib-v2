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
  Baik: '#10B981',
  'Rusak Ringan': '#F59E0B',
  'Rusak Berat': '#EF4444',
};

export function AsetKondisiChart({ data = [] }: AsetKondisiChartProps) {
  return (
    <div className="w-full bg-surface-elevated rounded-2xl p-4 sm:p-5 border border-border-subtle shadow-soft space-y-3">
      <div>
        <h3 className="text-sm font-bold text-text-high">Kondisi Fisik Aset Pos Pelkes</h3>
        <p className="text-xs text-text-muted">Aset Tanah, Bangunan, & Aset Bergerak (Baik, Rusak)</p>
      </div>

      <div className="w-full h-[240px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle, #E5E7EB)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--color-text-muted, #6B7280)" />
            <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-muted, #6B7280)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface-elevated, #ffffff)',
                borderRadius: '12px',
                border: '1px solid var(--color-border-subtle, #e5e7eb)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" name="Jumlah Aset" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3B82F6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
