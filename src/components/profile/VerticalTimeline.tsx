'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  date: string | Date;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'kmj' | 'pj' | 'mutasi' | 'sinodal' | 'mupel';
  };
  href?: string;
}

export interface VerticalTimelineProps {
  events: TimelineEvent[];
  emptyMessage?: string;
  className?: string;
}

export function VerticalTimeline({
  events = [],
  emptyMessage = 'Belum ada riwayat tercatat',
  className,
}: VerticalTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-surface-sunken/40 text-xs text-text-tertiary italic text-center border border-border-subtle">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('relative space-y-4 pl-4 sm:pl-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-line-hairline', className)}>
      {events.map((event) => {
        let dateStr = '-';
        if (event.date) {
          try {
            const d = typeof event.date === 'string' ? new Date(event.date) : event.date;
            dateStr = format(d, 'd MMM yyyy', { locale: idLocale });
          } catch {
            dateStr = String(event.date);
          }
        }

        let badgeClass = 'bg-surface-sunken text-text-muted border-border-subtle';
        if (event.badge?.variant === 'kmj') {
          badgeClass = 'bg-brand-primary text-white';
        } else if (event.badge?.variant === 'pj') {
          badgeClass = 'bg-accent-500/10 text-accent-600 border-accent-500/20';
        } else if (event.badge?.variant === 'mutasi') {
          badgeClass = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
        } else if (event.badge?.variant === 'sinodal') {
          badgeClass = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
        } else if (event.badge?.variant === 'mupel') {
          badgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        }

        const itemContent = (
          <div className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs hover:border-brand-primary/40 transition-all group min-h-[56px]">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold text-text-tertiary">{dateStr}</span>
                {event.badge && (
                  <span className={cn('px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider border', badgeClass)}>
                    {event.badge.label}
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-sm text-text-high group-hover:text-brand-primary transition-colors leading-snug truncate">
                {event.title}
              </h4>
              {event.subtitle && (
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{event.subtitle}</p>
              )}
            </div>

            {event.href && (
              <ChevronRight size={16} className="text-text-tertiary group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            )}
          </div>
        );

        return (
          <div key={event.id} className="relative group">
            {/* Timeline Dot Indicator */}
            <span className="absolute -left-4 sm:-left-6 top-4 w-2.5 h-2.5 rounded-full bg-brand-primary ring-4 ring-surface-base transition-transform group-hover:scale-125" />

            {event.href ? (
              <Link href={event.href} className="block cursor-pointer">
                {itemContent}
              </Link>
            ) : (
              itemContent
            )}
          </div>
        );
      })}
    </div>
  );
}

export default VerticalTimeline;
