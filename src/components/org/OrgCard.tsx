'use client';

import Link from 'next/link';
import { Church, Building2, MapPin, ChevronRight, User, Users, Map } from 'lucide-react';
import { OrgDirectoryItem } from '@/hooks/use-org-directory';
import { cn } from '@/lib/utils';

interface OrgCardProps {
  item: OrgDirectoryItem;
}

export function OrgCard({ item }: OrgCardProps) {
  const getBadgeStyle = (type: OrgDirectoryItem['type']) => {
    switch (type) {
      case 'mupel':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'jemaat_induk':
        return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'bajem':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'pos_pelkes':
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  const getIcon = (type: OrgDirectoryItem['type']) => {
    switch (type) {
      case 'mupel':
        return <Church size={20} className="text-purple-600 dark:text-purple-400" />;
      case 'jemaat_induk':
        return <Building2 size={20} className="text-brand-primary" />;
      case 'bajem':
        return <MapPin size={20} className="text-amber-600 dark:text-amber-400" />;
      case 'pos_pelkes':
      default:
        return <MapPin size={20} className="text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="group p-4 rounded-2xl bg-surface-elevated border border-border-subtle hover:border-brand-primary/40 shadow-xs hover:shadow-medium transition-all duration-200 flex flex-col justify-between space-y-3">
      <div>
        {/* Header Row: Icon + Name + Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-surface-sunken flex items-center justify-center shrink-0 border border-border-subtle">
              {getIcon(item.type)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-text-high leading-snug group-hover:text-brand-primary transition-colors truncate">
                {item.name}
              </h3>
              <p className="text-[11px] font-medium text-text-muted truncate mt-0.5">
                ID: {item.id}
              </p>
            </div>
          </div>

          <span
            className={cn(
              'px-2 py-0.5 text-[10px] font-black uppercase rounded-lg border shrink-0',
              getBadgeStyle(item.type)
            )}
          >
            {item.typeLabel}
          </span>
        </div>

        {/* Info Rows */}
        <div className="mt-3 space-y-1.5 text-xs text-text-muted border-t border-border-subtle/60 pt-2.5">
          {item.mupelName && (
            <div className="flex items-center gap-2">
              <Map size={14} className="shrink-0 text-text-muted/70" />
              <span className="truncate">
                Mupel: <strong className="text-text-high">{item.mupelName}</strong>
              </span>
            </div>
          )}

          {item.parentName && (
            <div className="flex items-center gap-2">
              <Building2 size={14} className="shrink-0 text-text-muted/70" />
              <span className="truncate">
                Induk: <strong className="text-text-high">{item.parentName}</strong>
              </span>
            </div>
          )}

          {item.leaderName && (
            <div className="flex items-center gap-2">
              <User size={14} className="shrink-0 text-text-muted/70" />
              <span className="truncate">
                {item.leaderRole || 'Pimpinan'}:{' '}
                <strong className="text-text-high">{item.leaderName}</strong>
              </span>
            </div>
          )}

          {item.address && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-text-muted/70" />
              <span className="truncate text-text-muted">{item.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Row: Quick Stats & Deep-Link Trigger */}
      <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] font-semibold text-text-muted">
          {typeof item.posCount === 'number' && item.posCount > 0 && (
            <span>{item.posCount} Pos</span>
          )}
          {typeof item.bajemCount === 'number' && item.bajemCount > 0 && (
            <span>{item.bajemCount} Bajem</span>
          )}
          {typeof item.jiwaCount === 'number' && item.jiwaCount > 0 && (
            <span className="flex items-center gap-1">
              <Users size={12} />
              {item.jiwaCount.toLocaleString('id-ID')} Jiwa
            </span>
          )}
        </div>

        <Link
          href={item.detailUrl}
          className="flex items-center gap-1 text-xs font-extrabold text-brand-primary hover:text-brand-primary/80 transition-colors py-1 px-2 rounded-lg hover:bg-brand-primary/10 min-h-[36px]"
        >
          <span>Detail</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
