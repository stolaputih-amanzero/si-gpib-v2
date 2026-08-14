'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users } from 'lucide-react';

interface ChartData {
  name: string;
  fullName?: string;
  icon?: string;
  warna?: string;
  total: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface-elevated p-3 rounded-xl border border-border-subtle shadow-medium text-xs space-y-1.5 min-w-[160px]">
        <p className="font-extrabold text-text-high text-sm flex items-center gap-1.5">
          <span>{data.icon || '👥'}</span>
          <span>{data.fullName || label}</span>
          <span className="text-text-muted font-semibold text-xs">({data.name || label})</span>
        </p>
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
          <span className="text-text-muted font-medium">Total Jiwa:</span>
          <span className="tabular-nums font-black text-brand-primary text-sm">{data.total} Jiwa</span>
        </div>
      </div>
    );
  }
  return null;
};

export function DemografiChart({ data }: { data: ChartData[] }) {
  // Standard Baku Pelkat Colors
  const defaultColors: Record<string, string> = {
    PA: '#10B981',   // Emerald
    PT: '#F59E0B',   // Amber
    GP: '#3B82F6',   // Blue
    PKP: '#8B5CF6',  // Purple
    PKB: '#64748B',  // Slate
    PKLU: '#F97316', // Orange
  };

  return (
    <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-surface-1 p-5 sm:p-6 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Users className="size-4.5" />
          </div>
          <div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-ink-primary">
              Komposisi Warga Jemaat
            </h3>
            <p className="micro-label text-ink-tertiary">Distribusi 6 Pelkat Sinode GPIB</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[280px]">
        {data.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-ink-secondary text-sm italic">
            Belum ada data demografi
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.12)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary, #64748b)', fontSize: 11, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary, #64748b)', fontSize: 11 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(217, 119, 6, 0.06)' }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={44}>
                  {data.map((item, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={item.warna || defaultColors[item.name] || '#D97706'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

