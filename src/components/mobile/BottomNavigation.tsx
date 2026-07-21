'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Map, Plus, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { label: 'Beranda', href: '/dashboard', icon: Home },
  { label: 'Hierarki', href: '/hierarki', icon: Map },
  { label: 'Input', href: '#', icon: Plus, isFAB: true },
  { label: 'Laporan', href: '/laporan', icon: FileText },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
];

export function BottomNavigation({ onFabClick }: BottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-elevated/95 backdrop-blur-md border-t border-border-subtle pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto relative">
        {NAV_ITEMS.map((item) => {
          if (item.isFAB) {
            return (
              <div key="fab-container" className="flex-shrink-0 w-14 flex justify-center -mt-6">
                <button
                  type="button"
                  onClick={onFabClick}
                  className="flex items-center justify-center w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary-dark active:scale-95 transition-all border-4 border-surface-elevated focus:outline-none focus:ring-4 focus:ring-brand-primary/20"
                  aria-label="Aksi Cepat"
                  title="Buka Aksi Cepat"
                >
                  <Plus className="w-7 h-7 stroke-[2.5px]" />
                </button>
              </div>
            );
          }

          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[64px] active:scale-95 transition-transform py-1',
                isActive ? 'text-brand-primary font-bold' : 'text-text-muted hover:text-text-high'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn('w-6 h-6', isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]')} />
              <span className="text-[10px] font-medium tracking-tight truncate max-w-[64px]">
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
