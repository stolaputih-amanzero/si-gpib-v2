'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import type { GrowthTrend } from '@/lib/domains/analytics/analytics.types';

interface GrowthChartProps {
  data: GrowthTrend[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-6 flex items-center justify-center h-[300px] text-text-muted text-sm">
        Belum ada data tren pertumbuhan.
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-4 md:p-6 shadow-sm">
      <h3 className="text-base font-bold text-text-high mb-4 flex items-center gap-2">
        📈 Tren Pertumbuhan (6 Bulan Terakhir)
      </h3>
      <div className="w-full h-[260px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-1)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
              itemStyle={{ color: 'var(--text-secondary)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="pos_count"
              name="Pos Pelkes"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#3B82F6' }}
            />
            <Line
              type="monotone"
              dataKey="pastoral_count"
              name="Log Pastoral"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
