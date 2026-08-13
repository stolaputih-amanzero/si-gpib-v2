'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, Users, Plus, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Organisasi', href: '/organisasi', icon: Building },
    { name: 'SDM', href: '/sdm', icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 pb-safe bg-background border-t h-16 safe-area-bottom">
      {/* Left Items */}
      <div className="flex flex-1 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Center FAB (Quick Actions) */}
      <div className="flex flex-col items-center justify-center shrink-0 px-2 -mt-6">
        <Button 
          size="icon" 
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => {
            // TODO: Open Quick Actions Sheet/Menu
            console.log('Open Quick Actions');
          }}
        >
          <Plus className="w-7 h-7" />
          <span className="sr-only">Quick Actions</span>
        </Button>
      </div>

      {/* Right Items */}
      <div className="flex flex-1 items-center justify-around">
        <Link
          href="/akun"
          className={cn(
            'flex flex-col items-center justify-center w-full h-full space-y-1',
            pathname?.startsWith('/akun') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Akun</span>
        </Link>
      </div>
    </div>
  );
}
