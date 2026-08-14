'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, Users, Plus, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContextUIStore } from '@/stores/useContextUIStore';
import { QuickActionSheet } from '@/components/mobile/QuickActionSheet';

export function BottomNavigation() {
  const pathname = usePathname();
  const { isQuickActionOpen, setQuickActionOpen } = useContextUIStore();

  const leftItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Organisasi', href: '/org', icon: Building },
  ];

  const rightItems = [
    { name: 'SDM', href: '/people', icon: Users },
    { name: 'Akun', href: '/settings', icon: UserCircle },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-safe">
        <nav className="pointer-events-auto grid grid-cols-5 items-center bg-surface-1/90 dark:bg-stone-900/90 backdrop-blur-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xl shadow-stone-900/10 dark:shadow-black/50 rounded-full px-3 h-16 w-full max-w-md relative">
          
          {/* Left Items (2 slots) */}
          {leftItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? (pathname === '/' || pathname === '/dashboard')
              : (pathname === item.href || pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 z-10"
              >
                {isActive && (
                  <span className="absolute inset-0 m-auto w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 rounded-full -z-10 animate-in zoom-in duration-200" />
                )}
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive 
                      ? "text-amber-700 dark:text-amber-400 scale-105" 
                      : "text-ink-tertiary group-hover:text-ink-primary"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-semibold tracking-tight transition-all duration-200",
                    isActive ? "text-amber-800 dark:text-amber-300 font-bold" : "text-ink-tertiary group-hover:text-ink-primary"
                  )}
                >
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute bottom-1.5 w-1 h-1 bg-amber-500 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Center FAB (Quick Actions) - Middle 3rd slot */}
          <div className="relative z-20 flex flex-col items-center justify-center -mt-7 group">
            <div className="absolute inset-0 bg-amber-500/25 rounded-full blur-xl scale-125 group-hover:scale-150 transition-transform opacity-70 duration-300" />
            <button 
              type="button"
              className="relative w-13 h-13 rounded-full shadow-lg shadow-amber-600/30 bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden shrink-0 border-2 border-white dark:border-stone-900"
              onClick={() => setQuickActionOpen(true)}
              aria-label="Aksi Cepat Pelayanan"
            >
              <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Right Items (2 slots) */}
          {rightItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 z-10"
              >
                {isActive && (
                  <span className="absolute inset-0 m-auto w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 rounded-full -z-10 animate-in zoom-in duration-200" />
                )}
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive 
                      ? "text-amber-700 dark:text-amber-400 scale-105" 
                      : "text-ink-tertiary group-hover:text-ink-primary"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-semibold tracking-tight transition-all duration-200",
                    isActive ? "text-amber-800 dark:text-amber-300 font-bold" : "text-ink-tertiary group-hover:text-ink-primary"
                  )}
                >
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute bottom-1.5 w-1 h-1 bg-amber-500 rounded-full" />
                )}
              </Link>
            );
          })}
          
        </nav>
      </div>

    <QuickActionSheet 
      isOpen={isQuickActionOpen} 
      onClose={() => setQuickActionOpen(false)} 
    />
  </>
  );
}
