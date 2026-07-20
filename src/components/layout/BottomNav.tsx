'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Plus, FileText, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Beranda', href: '/dashboard', icon: Home },
    { label: 'Peta', href: '/dashboard/peta', icon: Map },
    // FAB is in the middle, so we leave a space or handle it separately
  ];

  const navItemsRight = [
    { label: 'Laporan', href: '/dashboard/laporan', icon: FileText },
    { label: 'Profil', href: '/dashboard/profil', icon: User },
  ];

  const renderItem = (item: any) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Link 
        key={item.href}
        href={item.href} 
        className={`flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px] ${
          isActive ? 'text-brand-primary' : 'text-text-muted hover:text-text-high'
        }`}
      >
        <Icon size={24} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-elevated border-t border-gray-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-16 px-2 max-w-md mx-auto relative">
        {/* Left Nav Items */}
        <div className="flex flex-1 justify-around h-full">
          {navItems.map(renderItem)}
        </div>

        {/* FAB Container */}
        <div className="flex-shrink-0 w-16 flex justify-center -mt-6">
          <button 
            type="button"
            className="flex items-center justify-center w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-transform active:scale-95"
            aria-label="Tindakan Cepat"
          >
            <Plus size={28} className="stroke-2" />
          </button>
        </div>

        {/* Right Nav Items */}
        <div className="flex flex-1 justify-around h-full">
          {navItemsRight.map(renderItem)}
        </div>
      </div>
    </div>
  );
}
