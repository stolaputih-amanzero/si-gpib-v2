'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ChartPieData {
  name: string;
  value: number;
}

interface BantuanStatusChartProps {
  data?: ChartPieData[];
}

const COLORS: Record<string, string> = {
  Draft: '#9CA3AF',
  'Review KMJ': '#F59E0B',
  'Review Mupel': '#F97316',
  'Review Sinode': '#3B82F6',
  Disetujui: '#10B981',
  Ditolak: '#EF4444',
};

export function BantuanStatusChart({ data = [] }: BantuanStatusChartProps) {
  return (
    <div className="w-full bg-surface-elevated rounded-2xl p-4 sm:p-5 border border-border-subtle shadow-soft space-y-3">
      <div>
        <h3 className="text-sm font-bold text-text-high">Proporsi Status Pengajuan Bantuan</h3>
        <p className="text-xs text-text-muted">Status alur approval (Review KMJ, Mupel, Sinode, Approved)</p>
      </div>

      <div className="w-full h-[260px] sm:h-[300px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">
            Belum ada data pengajuan bantuan
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6B7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface-elevated, #ffffff)',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border-subtle, #e5e7eb)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
