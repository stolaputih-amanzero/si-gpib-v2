'use client';

import { cn } from '@/lib/utils';
import { UserRoleType } from '@/types/profile.types';

interface RoleBadgeProps {
  role?: UserRoleType | string | null;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const r = (role || 'pelayan').toLowerCase().trim();

  let label = 'Pelayan Field';
  let badgeStyle = 'bg-info-soft text-info border-info/20';

  if (r === 'super_user' || r === 'superadmin' || r === 'sinode') {
    label = 'Super User (Sinode)';
    badgeStyle = 'bg-surface-brand text-brand-600 border-brand-500/20';
  } else if (r === 'admin_mupel') {
    label = 'Admin Mupel';
    badgeStyle = 'bg-surface-accent text-accent-600 border-accent-500/20';
  } else if (r === 'kmj' || r === 'admin_jemaat') {
    label = 'Ketua Majelis Jemaat (KMJ)';
    badgeStyle = 'bg-ok-soft text-ok border-ok/20';
  } else if (r === 'pj' || r === 'pj_pos') {
    label = 'Pendeta Jemaat / PJ Pos';
    badgeStyle = 'bg-info-soft text-info border-info/20';
  } else if (r === 'pendeta') {
    label = 'Pendeta GPIB';
    badgeStyle = 'bg-info-soft text-info border-info/20';
  } else if (r === 'relawan') {
    label = 'Relawan Field';
    badgeStyle = 'bg-surface-sunken text-ink-secondary border-line-subtle';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 min-h-[28px] px-3 py-0.5 rounded-full text-xs font-semibold border shadow-2xs transition-colors shrink-0',
        badgeStyle,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse-soft" />
      <span className="truncate">{label}</span>
    </span>
  );
}
