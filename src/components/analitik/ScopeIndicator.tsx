'use client';

import { Globe, Building2, Church, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UserRoleScope {
  role: 'super_user' | 'admin_mupel' | 'kmj' | 'pj' | 'user' | string;
  id_mupel?: string | null;
  id_induk?: string | null;
  id_pos?: string | null;
  isLocked: boolean;
  scopeLabel: string;
}

interface ScopeIndicatorProps {
  scope: UserRoleScope | null;
  className?: string;
}

const SCOPE_ICONS: Record<string, typeof Globe> = {
  super_user: Globe,
  admin_mupel: Building2,
  kmj: Church,
  pj: MapPin,
  user: MapPin,
};

export function ScopeIndicator({ scope, className }: ScopeIndicatorProps) {
  if (!scope) return null;

  const Icon = SCOPE_ICONS[scope.role] || Globe;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2',
        'px-3 py-1.5 rounded-full',
        'text-xs font-medium',
        scope.isLocked
          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
          : 'bg-blue-50 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-400 border border-blue-200 dark:border-blue-900',
        className
      )}
      role="status"
      aria-label={`Cakupan data: ${scope.scopeLabel}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{scope.scopeLabel}</span>
    </div>
  );
}

export default ScopeIndicator;
