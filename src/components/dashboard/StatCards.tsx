import { MapPin, Users, Building2, CalendarCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface StatCardsProps {
  posCount: number;
  jemaatCount: number;
  totalJiwa: number;
  logCount: number;
}

export function StatCards({ posCount, jemaatCount, totalJiwa, logCount }: StatCardsProps) {
  const stats = [
    {
      title: 'Pos Pelkes',
      value: formatNumber(posCount),
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Jemaat Induk',
      value: formatNumber(jemaatCount),
      icon: Building2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Jiwa',
      value: formatNumber(totalJiwa),
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Giat Bulan Ini',
      value: logCount,
      icon: CalendarCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="border-border-subtle shadow-soft bg-surface-elevated overflow-hidden group hover:border-brand-primary/30 transition-colors">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className={`w-10 h-10 ${stat.bgColor} ${stat.color} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-text-high leading-none mb-1">{stat.value}</h3>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{stat.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
