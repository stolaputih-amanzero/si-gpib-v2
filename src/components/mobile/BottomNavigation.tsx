'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Plus, FileText, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Beranda', href: '/dashboard' },
    { icon: Map, label: 'Peta', href: '/pos-pelkes' },
    { icon: Plus, label: 'Input', href: '/quick-action', isMain: true },
    { icon: FileText, label: 'Laporan', href: '/pastoral' },
    { icon: User, label: 'Profil', href: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-elevated border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link key={item.href} href={item.href} className="relative -top-5 flex flex-col items-center">
                <div className="w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] transition-colors",
                isActive ? "text-brand-primary" : "text-text-muted hover:text-brand-primary"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
