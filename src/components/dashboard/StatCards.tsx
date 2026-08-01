'use client';

import { Layers, Church, Sprout, Users, CalendarCheck } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useReveal } from '@/hooks/useReveal';

interface StatCardsProps {
  mupelCount: number;
  jemaatCount: number;
  bajemCount: number;
  posCount: number;
  totalJiwa: number;
  logCount: number;
}

export function StatCards({
  mupelCount,
  jemaatCount,
  bajemCount,
  posCount,
  totalJiwa,
  logCount,
}: StatCardsProps) {
  const revealRef = useReveal<HTMLDivElement>();

  const stats = [
    {
      title: 'Mupel',
      value: formatNumber(mupelCount),
      icon: Layers,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Jemaat Induk',
      value: formatNumber(jemaatCount),
      icon: Church,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Bajem',
      value: formatNumber(bajemCount),
      icon: Church,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Pos Pelkes',
      value: formatNumber(posCount),
      icon: Sprout,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Jiwa',
      value: formatNumber(totalJiwa),
      icon: Users,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Giat Bulan Ini',
      value: formatNumber(logCount),
      icon: CalendarCheck,
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <div ref={revealRef} className="reveal-stagger grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {stats.map((stat, idx) => (
        <div key={idx} className="card-flat tap p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-tertiary">{stat.title}</p>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${stat.iconBg}`}>
              <stat.icon className="h-5 w-5" />
            </span>
          </div>
          <div>
            <p className="font-display tnum text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter2 text-ink-primary">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
