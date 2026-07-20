'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DemografiChartProps {
  data?: Array<{ kategori: string; laki: number; perempuan: number; total: number }>;
}

export function DemografiChart({ data = [] }: DemografiChartProps) {
  return (
    <div className="w-full bg-surface-elevated rounded-2xl p-4 sm:p-5 border border-border-subtle shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-high">Distribusi Demografi per Pelkat</h3>
          <p className="text-xs text-text-muted">Perbandingan jumlah anggota Laki-Laki & Perempuan</p>
        </div>
      </div>

      <div className="w-full h-[260px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle, #E5E7EB)" />
            <XAxis dataKey="kategori" tick={{ fontSize: 12 }} stroke="var(--color-text-muted, #6B7280)" />
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
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Bar dataKey="laki" name="Laki-laki" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="perempuan" name="Perempuan" fill="#EC4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
