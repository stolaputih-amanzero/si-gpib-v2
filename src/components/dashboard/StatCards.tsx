'use client';

import Link from 'next/link';
import { 
  Church, 
  Users, 
  CalendarCheck,
  Sprout,
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown
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
  // Named props (Legacy & Direct compatibility)
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
  // Custom array props
  stats?: StatCardData[];
  className?: string;
}

// Mapping ikon berdasarkan tipe/key
const ICON_MAP: Record<string, any> = {
  mupel: Layers,
  jemaat: Church,
  bajem: Church,
  pos: Sprout,
  jiwa: Users,
  giat: CalendarCheck,
};

// Mapping warna berdasarkan tipe/key
const COLOR_MAP: Record<string, { bg: string; text: string; gradient: string }> = {
  mupel: {
    bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-600 to-indigo-600',
  },
  jemaat: {
    bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    text: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-600 to-blue-600',
  },
  bajem: {
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-600 to-teal-600',
  },
  pos: {
    bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-600 to-cyan-600',
  },
  jiwa: {
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
  },
  giat: {
    bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    text: 'text-teal-600 dark:text-teal-400',
    gradient: 'from-teal-600 to-emerald-600',
  },
};

// Mapping rute navigasi terpusat berdasarkan tipe kartu
const ROUTE_MAP: Record<string, string> = getStatRoutes();

// Label aria untuk aksesibilitas
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

  // Construct items using hybrid props pattern (backward compatible)
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
      label: 'Jemaat Induk',
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
      label: sixthStat?.title || 'Giat Bulan Ini',
      value: typeof sixthStat?.value === 'number' ? formatNumber(sixthStat.value) : (sixthStat?.value || formatNumber(logCount)),
      href: sixthStat?.href || ROUTE_MAP.giat,
      iconKey: 'giat',
    },
  ];

  return (
    <div
      ref={revealRef}
      className={cn(
        'reveal-stagger grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5',
        className
      )}
    >
      {items.map((stat: any, idx: number) => {
        const key = stat.iconKey || stat.icon || stat.key || 'mupel';
        const IconComponent = typeof stat.icon === 'function' ? stat.icon : (ICON_MAP[key] || Layers);
        const colors = COLOR_MAP[key] || COLOR_MAP.mupel;
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
            className={cn(
              'group relative',
              'bg-surface-1 dark:bg-gray-800',
              'rounded-2xl p-3 sm:p-4',
              'border border-border-subtle dark:border-gray-700',
              'hover:border-brand-primary/40',
              'hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20',
              'active:scale-[0.98]',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'focus:ring-brand-primary dark:focus:ring-blue-400',
              'transition-all duration-200',
              'cursor-pointer flex flex-col justify-between',
              'min-h-[100px] sm:min-h-[120px]',
              'overflow-hidden'
            )}
            aria-label={ariaLabel}
          >
            {/* Decorative gradient background on hover */}
            <div
              className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100',
                'bg-gradient-to-br',
                colors.gradient,
                'transition-opacity duration-300',
                'pointer-events-none'
              )}
              aria-hidden="true"
            />

            {/* Header: Label & Icon */}
            <div className="relative z-10 flex items-center justify-between mb-1.5 sm:mb-2">
              <p
                className={cn(
                  'text-[10px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wide',
                  'text-ink-tertiary dark:text-gray-400',
                  'group-hover:text-white/90',
                  'transition-colors duration-200',
                  'truncate'
                )}
              >
                {stat.label || stat.title}
              </p>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span
                  className={cn(
                    'grid h-7 w-7 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl transition-all duration-200',
                    colors.bg,
                    'group-hover:bg-white/20 group-hover:text-white group-hover:backdrop-blur-sm'
                  )}
                >
                  <IconComponent className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                </span>
                <ChevronRight
                  className={cn(
                    'w-3.5 h-3.5 transition-all duration-200',
                    'text-ink-tertiary/40 dark:text-gray-600',
                    'group-hover:text-white',
                    'group-hover:translate-x-0.5',
                    'opacity-0 group-hover:opacity-100 hidden sm:block'
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Content: Value with Fraunces / Font Display */}
            <div className="relative z-10">
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <p
                  className={cn(
                    'font-display tnum text-xl sm:text-3xl lg:text-4xl font-black tracking-tighter2',
                    'text-ink-primary dark:text-white',
                    'group-hover:text-white',
                    'transition-colors duration-200'
                  )}
                >
                  {stat.value}
                </p>
                {stat.trend && (
                  <span
                    className={cn(
                      'flex items-center gap-0.5 text-xs font-semibold',
                      'transition-colors duration-200',
                      stat.trend.direction === 'up'
                        ? 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-100'
                        : 'text-red-600 dark:text-red-400 group-hover:text-red-100'
                    )}
                  >
                    {stat.trend.direction === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(stat.trend.value)}%
                  </span>
                )}
              </div>

              {/* Subtitle (optional) */}
              {stat.subtitle && (
                <p
                  className={cn(
                    'text-[11px] mt-0.5',
                    'text-ink-tertiary dark:text-gray-400',
                    'group-hover:text-white/80',
                    'transition-colors duration-200',
                    'line-clamp-1'
                  )}
                >
                  {stat.subtitle}
                </p>
              )}
            </div>

            {/* Bottom accent bar - animation on hover */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 h-0.5',
                'bg-gradient-to-r',
                colors.gradient,
                'transform scale-x-0 group-hover:scale-x-100',
                'origin-left',
                'transition-transform duration-300'
              )}
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </div>
  );
}

export default StatCards;
