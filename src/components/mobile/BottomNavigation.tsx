'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Map, GitFork, Plus, Database, Settings, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';
import { useCurrentUser } from '@/hooks/use-current-user';

export interface BottomNavigationProps {
  onFabClick: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  isFAB?: boolean;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Peta', href: '/dashboard/peta', icon: Map },
  { label: 'Struktur', href: '/hierarki', icon: GitFork },
  { label: 'Input', href: '#', icon: Plus, isFAB: true },
  { label: 'Pos & Bajem', href: '/dashboard/pos-pelkes', icon: Database },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
];

const READ_ONLY_NAV_ITEMS: NavItem[] = [
  { label: 'Profil Saya', href: '/settings/profile', icon: UserCheck },
];

export function BottomNavigation({ onFabClick }: BottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  const isReadOnly = currentUser?.role === 'read_only';
  const navItems = isReadOnly ? READ_ONLY_NAV_ITEMS : DEFAULT_NAV_ITEMS;

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.href !== '#') {
        router.prefetch(item.href);
      }
    });
  }, [router, navItems]);

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-1 backdrop-blur-md hairline-t pb-[env(safe-area-inset-bottom)] md:hidden shadow-xs select-none"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto relative">
        {navItems.map((item) => {
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
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                haptic.light();
                router.push(item.href);
              }}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors min-h-[44px]',
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-text-muted hover:text-text-high'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'stroke-[2.2] scale-105')} />
              <span className="text-[10px] truncate leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
