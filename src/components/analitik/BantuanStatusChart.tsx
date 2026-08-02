'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartPieData } from '@/hooks/use-analitik';
import { EmptyState } from '@/components/list/EmptyState';
import { FileText } from 'lucide-react';

export interface BantuanStatusChartProps {
  data: ChartPieData[];
  height?: number;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  'Draft': '#64748B',            // Slate
  'Review KMJ': '#EAB308',        // Kuning (matching PT color)
  'Review Mupel': '#1D4ED8',      // Biru Benhur (matching GP color)
  'Review Sinode': '#9333EA',     // Ungu (matching PKP color)
  'Disetujui': '#22C55E',         // Hijau (matching PA color)
  'Ditolak': '#EF4444',           // Red
};

export function BantuanStatusChart({ data, height = 280 }: BantuanStatusChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="card-flat p-5">
        <h2 className="text-base font-display font-bold text-ink-primary mb-3">Status Pengajuan Bantuan</h2>
        <EmptyState
          icon={FileText}
          title="Belum ada pengajuan bantuan"
          description="Tidak ada data pengajuan bantuan untuk filter yang dipilih."
        />
      </div>
    );
  }

  const totalBantuan = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      role="img"
      aria-label="Donut chart menunjukkan status workflow pengajuan bantuan"
      className="card-flat p-5 space-y-3 relative select-none"
    >
      <div className="pb-2.5 border-b border-border-subtle/50">
        <h2 className="text-base font-display font-bold text-ink-primary tracking-tightish">Status Workflow Pengajuan Bantuan</h2>
        <p className="text-xs text-ink-secondary font-medium">Distribusi status dari Draft hingga Approved/Rejected</p>
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
                      <p className="text-brand-primary font-bold text-sm">{item.value} pengajuan</p>
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
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="var(--surface-1)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={STATUS_COLOR_MAP[entry.name] || entry.color || '#3B82F6'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Overlay */}
        <div className="absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-2xl font-black font-display tnum text-ink-primary block leading-none">{totalBantuan}</span>
          <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">Bantuan</span>
        </div>
      </div>

      {/* Screen Reader Fallback Table */}
      <table className="sr-only">
        <caption>Status Pengajuan Bantuan</caption>
        <thead>
          <tr>
            <th>Status</th>
            <th>Jumlah Pengajuan</th>
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

export default BantuanStatusChart;
