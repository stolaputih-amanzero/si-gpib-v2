import { LucideIcon, TrendingUp } from 'lucide-react';

interface AnalyticsStatCardProps {
  title: string;
  value: number;
  trend: number;
  icon: LucideIcon;
  colorBg: string;
  colorIcon: string;
}

export function AnalyticsStatCard({
  title,
  value,
  trend,
  icon: Icon,
  colorBg,
  colorIcon,
}: AnalyticsStatCardProps) {
  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colorBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colorIcon}`} />
        </div>
        {trend > 0 && (
          <span className="inline-flex items-center text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{trend} bln ini
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-text-muted">{title}</p>
        <p className="text-2xl font-bold text-text-high mt-1">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
