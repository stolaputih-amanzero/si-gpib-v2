'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePastoralStats } from '@/lib/domains/pastoral/pastoral.queries';
import { Users, FileText, MapPin, TrendingUp } from 'lucide-react';

interface PastoralStatsProps {
  idJemaat: string;
  startDate?: string;
  endDate?: string;
}

export function PastoralStats({ idJemaat, startDate, endDate }: PastoralStatsProps) {
  const { data: stats, isLoading } = usePastoralStats(idJemaat, startDate, endDate);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: FileText, label: 'Total Log', value: stats.total_log, color: 'text-blue-600' },
    { icon: Users, label: 'Total Jiwa', value: stats.total_jiwa, color: 'text-green-600' },
    { icon: MapPin, label: 'Pos Aktif', value: stats.total_pos, color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Rata-rata Jiwa', value: stats.avg_jiwa_per_log, color: 'text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map(({ icon: Icon, label, value, color }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
