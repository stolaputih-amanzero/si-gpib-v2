'use client';

import Link from 'next/link';
import { 
  Church, 
  Users, 
  CalendarCheck,
  Sprout,
  Layers,
} from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';
import { cn, formatNumber } from '@/lib/utils';
import { useReveal } from '@/hooks/useReveal';
import { getStatRoutes } from '@/lib/utils/stat-routes';

export interface StatCardData {
  label: string;
  value: string | number;
  icon?: any;
  iconKey?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  subtitle?: string;
  href?: string;
}

export interface StatCardsProps {
  mupelCount?: number;
  jemaatCount?: number;
  bajemCount?: number;
  posCount?: number;
  totalJiwa?: number;
  logCount?: number;
  sixthStat?: {
    title: string;
    value: number | string;
    icon: any;
    iconBg?: string;
    href?: string;
  };
  stats?: StatCardData[];
  className?: string;
}

const ICON_MAP: Record<string, any> = {
  mupel: Layers,
  jemaat: Church,
  bajem: Church,
  pos: Sprout,
  jiwa: Users,
  giat: CalendarCheck,
};

const ROUTE_MAP: Record<string, string> = getStatRoutes();

const ARIA_LABEL_MAP: Record<string, string> = {
  mupel: 'Lihat struktur 25 Mupel Sinode GPIB',
  jemaat: 'Lihat rincian 350 Jemaat Induk Mandiri',
  bajem: 'Lihat daftar Bakal Jemaat (Bajem)',
  pos: 'Lihat daftar Pos Pelkes GPIB',
  jiwa: 'Lihat demografi 6 Pelkat GPIB',
  giat: 'Lihat feed kegiatan kunjungan pastoral',
};

export function StatCards({
  mupelCount,
  jemaatCount,
  bajemCount,
  posCount,
  totalJiwa,
  logCount = 0,
  sixthStat,
  stats: customStats,
  className,
}: StatCardsProps) {
  const revealRef = useReveal<HTMLDivElement>();

  const items = customStats || [
    {
      key: 'mupel',
      label: 'Mupel',
      value: formatNumber(mupelCount || 0),
      href: ROUTE_MAP.mupel,
      iconKey: 'mupel',
    },
    {
      key: 'jemaat',
      label: 'Jemaat',
      value: formatNumber(jemaatCount || 0),
      href: ROUTE_MAP.jemaat,
      iconKey: 'jemaat',
    },
    {
      key: 'bajem',
      label: 'Bajem',
      value: formatNumber(bajemCount || 0),
      href: ROUTE_MAP.bajem,
      iconKey: 'bajem',
    },
    {
      key: 'pos',
      label: 'Pos Pelkes',
      value: formatNumber(posCount || 0),
      href: ROUTE_MAP.pos,
      iconKey: 'pos',
    },
    {
      key: 'jiwa',
      label: 'Total Jiwa',
      value: formatNumber(totalJiwa || 0),
      href: ROUTE_MAP.jiwa,
      iconKey: 'jiwa',
    },
    {
      key: 'giat',
      label: sixthStat?.title || 'Giat Pastoral',
      value: typeof sixthStat?.value === 'number' ? formatNumber(sixthStat.value) : (sixthStat?.value || formatNumber(logCount)),
      href: sixthStat?.href || ROUTE_MAP.giat,
      iconKey: 'giat',
    },
  ];

  return (
    <div
      ref={revealRef}
      className={cn(
        'w-full py-2 border-y border-stone-200/80 dark:border-stone-800/80',
        className
      )}
    >
      <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-stone-200/60 dark:divide-stone-800/60">
        {items.map((stat: any, idx: number) => {
          const key = stat.iconKey || stat.icon || stat.key || 'mupel';
          const IconComponent = typeof stat.icon === 'function' ? stat.icon : (ICON_MAP[key] || Layers);
          const targetHref = stat.href || ROUTE_MAP[key] || '/hierarki';
          const ariaLabel = ARIA_LABEL_MAP[key] || `Lihat rincian ${stat.label || stat.title}`;

          const handleClick = () => {
            haptic('light');
          };

          return (
            <Link
              key={idx}
              href={targetHref}
              onClick={handleClick}
              className="group flex flex-col justify-between p-2.5 sm:p-3.5 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-all rounded-xl focus:outline-none"
              aria-label={ariaLabel}
            >
              {/* Header Label */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="micro-label text-ink-tertiary group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors truncate">
                  {stat.label || stat.title}
                </span>
                <span className="size-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-500 shrink-0 transition-colors" />
              </div>

              {/* Metric Value */}
              <div className="flex items-baseline justify-between gap-1 mt-0.5">
                <span className="font-editorial tnum text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {stat.value}
                </span>
                <IconComponent className="size-3.5 sm:size-4 text-ink-tertiary/60 group-hover:text-amber-600 shrink-0 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default StatCards;
