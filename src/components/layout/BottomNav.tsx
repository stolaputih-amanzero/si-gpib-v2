'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Database, Plus, GitFork, Menu } from 'lucide-react';

interface BottomNavProps {
  onOpenDrawer?: () => void;
}

export default function BottomNav({ onOpenDrawer }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Beranda', href: '/dashboard', icon: Home },
    { label: 'Pos Pelkes', href: '/dashboard/pos-pelkes', icon: Database },
  ];

  const renderItem = (item: { label: string; href: string; icon: any }) => {
    const isActive =
      pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] transition-colors ${
          isActive ? 'text-brand-primary font-bold' : 'text-text-muted hover:text-text-high'
        }`}
      >
        <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
        <span className="text-[10px] mt-1 font-medium tracking-tight truncate max-w-[64px]">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-elevated/95 backdrop-blur-md border-t border-border-subtle pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center h-16 px-1.5 max-w-md mx-auto relative">
        {/* Left Nav Items */}
        <div className="flex flex-1 justify-around h-full">
          {navItems.map(renderItem)}
        </div>

        {/* Center FAB Container */}
        <div className="flex-shrink-0 w-14 flex justify-center -mt-5">
          <Link
            href="/dashboard/pos-pelkes/baru"
            className="flex items-center justify-center w-13 h-13 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-primary/90 active:scale-95 focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all border-2 border-surface-elevated"
            aria-label="Tambah Pos Pelkes"
            title="Tambah Pos Pelkes Baru"
          >
            <Plus size={26} className="stroke-[2.5px]" />
          </Link>
        </div>

        {/* Right Nav Items */}
        <div className="flex flex-1 justify-around h-full items-center">
          {/* Hierarki */}
          <Link
            href="/hierarki"
            className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] transition-colors ${
              pathname.startsWith('/hierarki') ? 'text-brand-primary font-bold' : 'text-text-muted hover:text-text-high'
            }`}
          >
            <GitFork size={22} className={pathname.startsWith('/hierarki') ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] mt-1 font-medium tracking-tight truncate max-w-[64px]">Hierarki</span>
          </Link>

          {/* Menu Drawer Button */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] text-text-muted hover:text-brand-primary active:scale-95 transition-colors"
            aria-label="Buka Semua Menu Navigasi"
          >
            <div className="relative">
              <Menu size={22} className="stroke-2 text-brand-primary" />
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            </div>
            <span className="text-[10px] mt-1 font-bold text-brand-primary tracking-tight">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
