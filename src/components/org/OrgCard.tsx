'use client';

import Link from 'next/link';
import { Church, Building2, MapPin, ChevronRight, Users, Map } from 'lucide-react';
import { OrgDirectoryItem } from '@/hooks/use-org-directory';
import { cn } from '@/lib/utils';
import { SemanticRow } from '@/components/ui/SemanticRow';

interface OrgCardProps {
  item: OrgDirectoryItem;
  isLast?: boolean;
}

export function OrgCard({ item, isLast = false }: OrgCardProps) {
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

  const subtitleContent = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-muted mt-0.5">
      {item.parentName && (
        <span className="inline-flex items-center gap-1">
          <Building2 size={12} className="text-text-muted/70 shrink-0" />
          <span>Jemaat Induk: <strong className="text-text-high">{item.parentName}</strong></span>
        </span>
      )}
      {item.mupelName && (
        <span className="inline-flex items-center gap-1">
          <Map size={12} className="text-text-muted/70 shrink-0" />
          <span>Mupel: <strong className="text-text-high">{item.mupelName}</strong></span>
        </span>
      )}
    </div>
  );

  return (
    <Link href={item.detailUrl} className="block w-full virtual-list-item">
      <SemanticRow
        isLast={isLast}
        leftSlot={
          <div className="w-10 h-10 rounded-control bg-surface-sunken flex items-center justify-center border border-border-subtle shrink-0">
            {getIcon(item.type)}
          </div>
        }
        title={
          <span className="text-sm font-bold text-text-high hover:text-brand-primary transition-colors">
            {item.name}
          </span>
        }
        badge={
          <span
            className={cn(
              'px-2 py-0.5 text-[10px] font-black uppercase rounded-lg border shrink-0',
              getBadgeStyle(item.type)
            )}
          >
            {item.typeLabel}
          </span>
        }
        subtitle={subtitleContent}
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-text-muted">
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
            <ChevronRight size={18} className="text-text-muted group-hover:translate-x-0.5 transition-transform" />
          </div>
        }
      />
    </Link>
  );
}
