'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, Users, Plus, UserCircle, BarChart3, Map, Calendar, HandHeart, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContextUIStore } from '@/stores/useContextUIStore';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { setQuickActionOpen } = useContextUIStore();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Organisasi', href: '/org', icon: Building },
    { name: 'SDM', href: '/people', icon: Users },
    { name: 'Analitik', href: '/analytics', icon: BarChart3 },
    { name: 'Peta & Teritori', href: '/maps', icon: Map },
    { name: 'Jadwal', href: '/jadwal', icon: Calendar },
    { name: 'Bantuan', href: '/aid-requests', icon: HandHeart },
    { name: 'Brankas (Vault)', href: '/vault', icon: ShieldCheck },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-64 border-r bg-surface-base h-[100dvh] sticky top-0 shrink-0">
      <div className="flex h-16 items-center justify-center lg:justify-start lg:px-6 border-b shrink-0">
        <div className="font-display font-bold text-xl tracking-tight text-primary">SI GPIB</div>
      </div>
      
      <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
        <div className="lg:px-3 pt-2 pb-1">
          <p className="hidden lg:block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Utama
          </p>
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center lg:px-3 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 mx-auto lg:mx-0 shrink-0", isActive ? "text-primary" : "group-hover:scale-110 transition-transform")} />
              <span className="hidden lg:block ml-3 text-sm">{item.name}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}

        <div className="mt-4 mb-2 border-t border-border-subtle pt-4">
          <button 
            type="button"
            className="w-full justify-center lg:justify-start lg:px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-amber-600/20 flex items-center h-12 cursor-pointer border border-amber-400/20 group"
            onClick={() => setQuickActionOpen(true)}
            aria-label="Aksi Cepat Pelayanan"
          >
            <Plus className="size-5 lg:mr-2.5 shrink-0 text-white group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden lg:block text-sm font-bold text-white tracking-tight">Aksi Cepat</span>
          </button>
        </div>
      </div>

      <div className="p-3 border-t">
        <Link
          href="/settings"
          className={cn(
            "group relative flex items-center lg:px-3 py-3 rounded-xl transition-all duration-200",
            pathname?.startsWith('/settings') 
              ? "bg-primary/10 text-primary font-semibold" 
              : "text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
          )}
        >
          <UserCircle className={cn("w-5 h-5 mx-auto lg:mx-0 shrink-0", pathname?.startsWith('/settings') ? "text-primary" : "group-hover:scale-110 transition-transform")} />
          <span className="hidden lg:block ml-3 text-sm">Akun & Pengaturan</span>
        </Link>
      </div>
    </aside>
  );
}
