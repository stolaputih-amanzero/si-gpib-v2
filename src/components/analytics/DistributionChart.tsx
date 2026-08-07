'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import type { MupelDistribution } from '@/lib/domains/analytics/analytics.types';

interface DistributionChartProps {
  data: MupelDistribution[];
}

export function DistributionChart({ data }: DistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-center h-[300px] text-gray-400 text-sm">
        Belum ada data sebaran Mupel.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        📊 Distribusi per Mupel
      </h3>
      <div className="w-full h-[260px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="nama_mupel" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="pos_count" name="Pos Pelkes" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="pendeta_count" name="Pendeta" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
