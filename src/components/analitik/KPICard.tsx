import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  badgeColor?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  badgeColor = 'bg-brand-primary/10 text-brand-primary',
  className,
}: KPICardProps) {
  const formatNumber = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('id-ID').format(val);
    }
    return val;
  };

  return (
    <div
      className={cn(
        'bg-surface-1 p-4 rounded-2xl border border-border-subtle shadow-2xs flex items-center justify-between min-h-[56px] transition-all hover:border-brand-primary/40 select-none',
        className
      )}
    >
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-xs text-text-tertiary font-bold truncate">{title}</p>
        <p className="text-2xl font-display font-extrabold text-text-high tabular-nums leading-tight">
          {formatNumber(value)}
        </p>
        {subtitle && <p className="text-[11px] text-text-tertiary truncate">{subtitle}</p>}
      </div>

      {icon && (
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ml-3 shadow-2xs', badgeColor)}>
          {icon}
        </div>
      )}
    </div>
  );
}

export default KPICard;
