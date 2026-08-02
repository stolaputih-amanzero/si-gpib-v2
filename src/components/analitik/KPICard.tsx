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
  badgeColor = 'bg-brand-500/10 text-brand-primary',
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
        'card-flat tap p-4 flex flex-col justify-between select-none min-h-[104px]',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-tertiary truncate">{title}</p>
        {icon && (
          <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl ml-2', badgeColor)}>
            {icon}
          </span>
        )}
      </div>

      <div>
        <p className="font-display tnum text-2xl sm:text-3xl font-black tracking-tighter2 text-ink-primary leading-tight">
          {formatNumber(value)}
        </p>
        {subtitle && <p className="text-[11px] text-ink-secondary font-medium truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default KPICard;
