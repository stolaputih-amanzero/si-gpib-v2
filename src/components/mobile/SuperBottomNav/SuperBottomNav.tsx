'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavItem } from './NavItem';
import { SuperButton } from './SuperButton';
import { MasterMenuSheet } from './MasterMenuSheet';
import { DIRECT_NAV_ITEMS } from '@/lib/constants/navigation';

export function SuperBottomNav() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSuperButton = () => {
    setIsSheetOpen(prev => !prev);
  };

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ===== BOTTOM NAV BAR ===== */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 md:hidden',
          'bg-surface-elevated/95 backdrop-blur-xl',
          'border-t border-border-subtle',
          'pb-[env(safe-area-inset-bottom)]',
          'transition-all duration-300',
          isSheetOpen && 'translate-y-full opacity-0 pointer-events-none' 
        )}
        role="navigation"
        aria-label="Navigasi utama"
      >
        <div className="grid grid-cols-5 w-full items-end justify-items-center h-[60px] px-1">
          {DIRECT_NAV_ITEMS.map((item) => {
            if (item.order === 3) {
              return (
                <div key="quick-actions" className="flex items-center justify-center w-full">
                  <SuperButton onClick={handleSuperButton} isOpen={isSheetOpen} />
                </div>
              );
            }
            return (
              <NavItem
                key={item.href}
                {...item}
                isActive={isActiveRoute(item.href)}
              />
            );
          })}
        </div>
      </nav>

      {/* ===== MASTER MENU BOTTOM SHEET ===== */}
      <MasterMenuSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  );
}
