'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav
      aria-label="Breadcrumb Navigasi Hierarki"
      className="w-full overflow-x-auto no-scrollbar py-2 px-1 flex items-center gap-1.5 text-xs font-medium text-text-muted select-none"
    >
      <Link
        href="/hierarki"
        className="flex items-center gap-1 min-h-[36px] px-2 py-1 rounded-lg hover:bg-surface-sunken hover:text-brand-primary transition-colors shrink-0 font-semibold"
      >
        <Home size={14} className="text-brand-primary" />
        <span>Hierarki</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight size={14} className="text-text-muted/60 shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center min-h-[36px] px-2 py-1 rounded-lg hover:bg-surface-sunken hover:text-brand-primary transition-colors font-semibold max-w-[160px] sm:max-w-[220px] truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg max-w-[180px] sm:max-w-[260px] truncate ${
                  isLast || item.isCurrent
                    ? 'bg-brand-primary/10 text-brand-primary font-bold'
                    : 'text-text-high font-medium'
                }`}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
