import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: string;
  badgeColor?: string;
}

export function KPICard({ title, value, subtitle, icon, badgeColor = 'bg-brand-primary/10 text-brand-primary' }: KPICardProps) {
  const formatNumber = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('id-ID').format(val);
    }
    return val;
  };

  return (
    <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-soft flex items-center justify-between min-h-[44px] transition-all hover:border-brand-primary/30">
      <div className="space-y-1 min-w-0">
        <p className="text-xs text-text-muted font-semibold truncate">{title}</p>
        <p className="text-2xl font-serif font-extrabold text-text-high tabular-nums">
          {formatNumber(value)}
        </p>
        {subtitle && <p className="text-[11px] text-text-muted truncate">{subtitle}</p>}
      </div>

      {icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${badgeColor}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
