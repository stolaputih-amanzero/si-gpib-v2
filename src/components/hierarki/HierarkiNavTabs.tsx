'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitFork, Map, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HierarkiNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      label: 'Struktur Hierarki',
      href: '/hierarki',
      icon: GitFork,
    },
    {
      label: 'Peta Sebaran',
      href: '/dashboard/peta',
      icon: Map,
    },
    {
      label: 'Pos & Bajem',
      href: '/dashboard/pos-pelkes',
      icon: Database,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 bg-surface-sunken p-1.5 rounded-xl border border-border-subtle shadow-inner">
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/hierarki'
            ? pathname === '/hierarki' || (pathname.startsWith('/hierarki/') && !pathname.startsWith('/hierarki/pos'))
            : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px]',
              isActive
                ? 'bg-surface-elevated text-brand-primary shadow-soft border border-border-subtle/40'
                : 'text-text-muted hover:text-text-high hover:bg-surface-elevated/40'
            )}
          >
            <Icon size={14} className={isActive ? 'text-brand-primary' : 'text-text-muted'} />
            <span className="truncate">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
