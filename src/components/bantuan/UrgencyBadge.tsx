import { UrgensiType } from '@/lib/validations/bantuan.schema';
import { AlertTriangle, Clock, Flame, ShieldAlert } from 'lucide-react';

interface UrgencyBadgeProps {
  urgensi: UrgensiType | string;
  size?: 'sm' | 'md';
}

export function UrgencyBadge({ urgensi, size = 'md' }: UrgencyBadgeProps) {
  const getBadgeStyle = () => {
    switch (urgensi) {
      case 'Rendah':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40',
          icon: Clock,
          label: 'Urgensi Rendah',
        };
      case 'Sedang':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40',
          icon: AlertTriangle,
          label: 'Urgensi Sedang',
        };
      case 'Tinggi':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/40',
          icon: Flame,
          label: 'Urgensi Tinggi',
        };
      case 'Kritis':
        return {
          bg: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/40 animate-pulse',
          icon: ShieldAlert,
          label: 'Urgensi Kritis',
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: Clock,
          label: urgensi,
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${style.bg} ${
        isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon size={isSmall ? 11 : 13} className="shrink-0" />
      <span>{style.label}</span>
    </span>
  );
}
