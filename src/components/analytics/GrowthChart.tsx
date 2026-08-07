'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import type { GrowthTrend } from '@/lib/domains/analytics/analytics.types';

interface GrowthChartProps {
  data: GrowthTrend[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-center h-[300px] text-gray-400 text-sm">
        Belum ada data tren pertumbuhan.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        📈 Tren Pertumbuhan (6 Bulan Terakhir)
      </h3>
      <div className="w-full h-[260px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="pos_count"
              name="Pos Pelkes"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563EB' }}
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
