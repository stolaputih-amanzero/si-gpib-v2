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

  const leftItems = DIRECT_NAV_ITEMS.filter(i => i.order <= 2);
  const rightItems = DIRECT_NAV_ITEMS.filter(i => i.order >= 4);

  const handleSuperButton = () => {
    setIsSheetOpen(prev => !prev);
  };

  // Helper untuk cek active state
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
          'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
          'border-t border-gray-200/50 dark:border-gray-700/50',
          'pb-[env(safe-area-inset-bottom)]',
          'transition-all duration-300',
          // Sembunyikan nav bar saat sheet terbuka agar fokus ke sheet
          isSheetOpen && 'translate-y-full opacity-0 pointer-events-none' 
        )}
        role="navigation"
        aria-label="Navigasi utama"
      >
        <div className="relative flex items-end justify-around px-2 h-[64px]">
          {/* Kiri: 2 item langsung */}
          {leftItems.map(item => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActiveRoute(item.href)}
            />
          ))}

          {/* Tengah: Super Button */}
          <div className="flex-1 flex justify-center">
             <SuperButton
               onClick={handleSuperButton}
               isOpen={isSheetOpen}
             />
          </div>

          {/* Kanan: 2 item langsung */}
          {rightItems.map(item => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActiveRoute(item.href)}
            />
          ))}
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
