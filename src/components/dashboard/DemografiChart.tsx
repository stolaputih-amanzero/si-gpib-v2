'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ChartData {
  name: string;
  total: number;
}

export function DemografiChart({ data }: { data: ChartData[] }) {
  // Brand colors or a specific palette
  const colors = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#F59E0B', '#EF4444'];

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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} Jiwa`, 'Total']}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {data.map((entry, index) => (
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
