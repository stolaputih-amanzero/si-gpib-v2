'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, Users, Plus, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
        <nav className="pointer-events-auto grid grid-cols-5 items-center bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border border-border/50 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-3xl px-2 h-16 w-full max-w-md relative before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none">
          
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
                  <span className="absolute inset-0 m-auto w-12 h-12 bg-primary/10 rounded-2xl -z-10 animate-in zoom-in duration-300" />
                )}
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive 
                      ? "text-primary scale-110 drop-shadow-sm" 
                      : "text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-semibold transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}

          {/* Center FAB (Quick Actions) - Middle 3rd slot */}
          <div className="relative z-20 flex flex-col items-center justify-center -mt-7 group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 group-hover:scale-175 transition-transform opacity-0 group-hover:opacity-100 duration-500" />
            <Button 
              size="icon" 
              className="relative w-14 h-14 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 bg-gradient-to-tr from-primary to-primary/80 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden shrink-0"
              onClick={() => setQuickActionOpen(true)}
            >
              <Plus className="w-6 h-6 text-primary-foreground group-hover:rotate-90 transition-transform duration-500" />
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="sr-only">Quick Actions</span>
            </Button>
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
                  <span className="absolute inset-0 m-auto w-12 h-12 bg-primary/10 rounded-2xl -z-10 animate-in zoom-in duration-300" />
                )}
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive 
                      ? "text-primary scale-110 drop-shadow-sm" 
                      : "text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5"
                  )} 
                />
                <span 
                  className={cn(
                    "text-[10px] font-semibold transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
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
