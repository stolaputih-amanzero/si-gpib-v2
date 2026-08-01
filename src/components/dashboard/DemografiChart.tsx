'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ChartData {
  name: string;
  total: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-elevated p-3 rounded-xl border border-border-subtle shadow-medium text-xs space-y-1 min-w-[140px]">
        <p className="font-extrabold text-text-high">{label}</p>
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
          <span className="text-text-muted font-medium">Total Jiwa:</span>
          <span className="tabular-nums font-black text-brand-primary">{payload[0].value} Jiwa</span>
        </div>
      </div>
    );
  }
  return null;
};

export function DemografiChart({ data }: { data: ChartData[] }) {
  // Harmonious palette for Pelkat categories
  const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <Card className="border-border-subtle shadow-soft bg-surface-elevated">
      <CardHeader className="pb-2 border-b border-border-subtle/50 mb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-text-high">
          <Users className="w-5 h-5 text-brand-primary" />
          Komposisi Warga Jemaat (Pelkat)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-text-muted text-sm italic">
            Belum ada data demografi
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.15)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted, #94a3b8)', fontSize: 12 }} 
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
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
