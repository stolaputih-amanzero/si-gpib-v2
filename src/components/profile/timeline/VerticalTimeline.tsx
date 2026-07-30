'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineItemProps {
  id: string;
  date: string;
  title: string;
  subtitle?: string | null;
  badge?: React.ReactNode;
  body?: string | null;
  href?: string | null;
  dotClass?: string;
}

interface VerticalTimelineProps {
  items: TimelineItemProps[];
  emptyMessage?: string;
  formatDateFn?: (d: string) => string;
}

export function VerticalTimeline({ items, emptyMessage = 'Belum ada riwayat.', formatDateFn }: VerticalTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className="card-flat p-8 text-center space-y-2">
        <Clock size={32} className="mx-auto text-ink-tertiary opacity-40" />
        <p className="text-sm font-medium text-ink-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ol className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-line-subtle reveal-stagger in">
      {items.map((item) => {
        const formattedDate = formatDateFn ? formatDateFn(item.date) : item.date;

        const contentNode = (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium text-ink-tertiary tnum">
                {formattedDate}
              </span>
              {item.badge && <div className="shrink-0">{item.badge}</div>}
            </div>

            <h4 className="text-sm font-semibold text-ink-primary flex items-center justify-between gap-2">
              <span>{item.title}</span>
              {item.href && <ChevronRight size={16} className="text-brand-600 shrink-0" />}
            </h4>

            {item.subtitle && (
              <p className="text-xs font-medium text-brand-600">{item.subtitle}</p>
            )}

            {item.body && (
              <p className="text-xs text-ink-secondary leading-relaxed bg-surface-sunken p-2.5 rounded-xl border border-line-subtle mt-1 font-mono">
                {item.body}
              </p>
            )}
          </div>
        );

        return (
          <li key={item.id} className="relative group">
            {/* Dot Indicator */}
            <span
              className={cn(
                'absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-surface-1 border-2 border-brand-500 shadow-2xs group-hover:scale-125 transition-transform shrink-0',
                item.dotClass
              )}
            />

            {item.href ? (
              <Link
                href={item.href}
                className="block p-3 rounded-2xl bg-surface-1 hover:bg-surface-sunken border border-line-subtle transition-all tap"
              >
                {contentNode}
              </Link>
            ) : (
              <div className="p-3 rounded-2xl bg-surface-1 border border-line-subtle">
                {contentNode}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
