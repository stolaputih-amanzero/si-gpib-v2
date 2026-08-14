import { LucideIcon, TrendingUp } from 'lucide-react';

interface AnalyticsStatCardProps {
  title: string;
  value: number;
  trend: number;
  icon: LucideIcon;
  colorBg?: string;
  colorIcon?: string;
}

export function AnalyticsStatCard({
  title,
  value,
  trend,
  icon: Icon,
  colorBg = 'bg-amber-500/10',
  colorIcon = 'text-amber-600 dark:text-amber-400',
}: AnalyticsStatCardProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800 hover:border-amber-500/35 transition-all flex flex-col justify-between group">
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className={`size-8 sm:size-9 rounded-xl ${colorBg} flex items-center justify-center shrink-0`}>
          <Icon className={`size-4 sm:size-4.5 ${colorIcon}`} />
        </div>
        {trend > 0 ? (
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
            <TrendingUp className="size-2.5 mr-1" />
            +{trend} bln ini
          </span>
        ) : (
          <span className="size-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors shrink-0" />
        )}
      </div>
      <div>
        <span className="micro-label text-ink-tertiary block group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors truncate">
          {title}
        </span>
        <p className="font-editorial tnum text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mt-0.5">
          {value.toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}
