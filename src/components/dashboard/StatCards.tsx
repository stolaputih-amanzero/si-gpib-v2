'use client';

import { MapPin, Users, Building2, CalendarCheck } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useReveal } from '@/hooks/useReveal';

interface StatCardsProps {
  posCount: number;
  jemaatCount: number;
  totalJiwa: number;
  logCount: number;
}

export function StatCards({ posCount, jemaatCount, totalJiwa, logCount }: StatCardsProps) {
  const revealRef = useReveal<HTMLDivElement>();

  const stats = [
    {
      title: 'Pos Pelkes',
      value: formatNumber(posCount),
      icon: MapPin,
      iconBg: 'bg-surface-brand text-brand-600',
    },
    {
      title: 'Jemaat Induk',
      value: formatNumber(jemaatCount),
      icon: Building2,
      iconBg: 'bg-ok-soft text-ok',
    },
    {
      title: 'Total Jiwa',
      value: formatNumber(totalJiwa),
      icon: Users,
      iconBg: 'bg-accent-soft text-accent-600',
    },
    {
      title: 'Giat Bulan Ini',
      value: formatNumber(logCount),
      icon: CalendarCheck,
      iconBg: 'bg-info-soft text-info',
    },
  ];

  return (
    <div ref={revealRef} className="reveal-stagger grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {stats.map((stat, idx) => (
        <div key={idx} className="card-flat tap p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">{stat.title}</p>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stat.iconBg}`}>
              <stat.icon className="h-5 w-5" />
            </span>
          </div>
          <div>
            <p className="font-display tnum text-3xl md:text-4xl font-semibold tracking-tighter2 text-ink-primary">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
