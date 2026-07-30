'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Map, GitFork, Plus, Database, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';

export interface BottomNavigationProps {
  onFabClick: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  isFAB?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Peta', href: '/dashboard/peta', icon: Map },
  { label: 'Struktur', href: '/hierarki', icon: GitFork },
  { label: 'Input', href: '#', icon: Plus, isFAB: true },
  { label: 'Pos & Bajem', href: '/dashboard/pos-pelkes', icon: Database },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
];

export function BottomNavigation({ onFabClick }: BottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.href !== '#') {
        router.prefetch(item.href);
      }
    });
  }, [router]);

  return (
    <nav 
      data-testid="bottom-nav" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-1 backdrop-blur-md hairline-t pb-[env(safe-area-inset-bottom)] md:hidden shadow-xs select-none"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto relative">
        {NAV_ITEMS.map((item) => {
          if (item.isFAB) {
            return (
              <div key="fab-container" className="flex-shrink-0 w-14 flex justify-center -mt-6">
                <button
                  type="button"
                  data-testid="bottom-nav-fab"
                  onClick={() => {
                    haptic.medium();
                    onFabClick();
                  }}
                  className="flex items-center justify-center w-14 h-14 bg-brand-600 text-white rounded-full shadow-md shadow-brand-600/30 hover:bg-brand-700 active:scale-95 transition-all border-4 border-surface-base focus:outline-none focus:ring-4 focus:ring-brand-600/20"
                  aria-label="Aksi Cepat Pelayanan"
                  title="Buka Aksi Cepat"
                >
                  <Plus className="w-7 h-7 stroke-[2.5px]" />
                </button>
              </div>
            );
          }

          const isActive =
            item.href !== '#' &&
            (pathname === item.href || pathname.startsWith(item.href + '/'));
          const Icon = item.icon;

          const itemTestId = item.label === 'Peta' 
            ? 'bottom-nav-peta' 
            : item.label === 'Pos & Bajem' || item.label === 'Laporan' 
            ? 'bottom-nav-laporan' 
            : `bottom-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

          return (
            <button
              key={item.href}
              type="button"
              data-testid="bottom-nav-item"
              data-nav-id={itemTestId}
              id={itemTestId}
              onClick={() => {
                haptic.selection();
                router.push(item.href);
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[64px] active:scale-95 transition-transform py-1',
                isActive ? 'text-brand-600 font-bold' : 'text-ink-tertiary hover:text-ink-secondary'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn('w-6 h-6', isActive ? 'text-brand-600 stroke-[2.5px]' : 'text-ink-tertiary stroke-[1.8px]')} />
              <span className="text-[10px] font-medium tracking-tight truncate max-w-[64px] text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
