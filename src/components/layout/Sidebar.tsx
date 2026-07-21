'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import { NAVIGATION_GROUPS, NavItem } from '@/lib/constants/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load preference from localStorage on mount safely
  useEffect(() => {
    const saved = localStorage.getItem('gpib_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gpib_sidebar_collapsed', String(newState));
    }
  };

  const navigationGroups = NAVIGATION_GROUPS;

  const renderItem = (item: NavItem) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group relative flex items-center min-h-[44px] rounded-xl text-xs font-semibold transition-all duration-200 ${
          isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2.5'
        } ${
          isActive
            ? 'bg-brand-primary/10 text-brand-primary font-bold shadow-xs'
            : 'text-text-muted hover:bg-surface-sunken hover:text-text-high'
        }`}
      >
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'min-w-0'}`}>
          <Icon
            size={18}
            className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${
              isActive ? 'text-brand-primary stroke-[2.5px]' : 'text-text-muted stroke-[1.8px]'
            }`}
          />
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </div>

        {!isCollapsed && item.badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-brand-primary/15 text-brand-primary shrink-0">
            {item.badge}
          </span>
        )}

        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-primary rounded-r-full" />
        )}

        {/* Floating Tooltip when Collapsed */}
        {isCollapsed && (
          <div className="absolute left-16 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg z-50 whitespace-nowrap">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-screen bg-surface-elevated border-r border-border-subtle sticky top-0 left-0 z-30 select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header Logo & Toggle Button */}
      <div
        className={`h-16 flex items-center border-b border-border-subtle shrink-0 transition-all duration-300 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/logo-si-gpib.png"
                alt="Logo SI GPIB"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="truncate">
              <h1 className="text-base font-black text-brand-primary leading-tight tracking-tight truncate">
                SI GPIB
              </h1>
              <p className="text-[10px] font-medium text-text-muted truncate">Pos Pelayanan Kesaksian</p>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <Link href="/dashboard" className="p-1 rounded-xl group" title="Beranda SI GPIB">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
              <Image
                src="/logo-si-gpib.png"
                alt="Logo SI GPIB"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
        )}

        {/* Toggle Collapse Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="p-2 rounded-xl text-text-muted hover:text-text-high hover:bg-surface-sunken active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          aria-label={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} className="text-brand-primary" />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed ? (
              <h2 className="px-3 text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5">
                {group.title}
              </h2>
            ) : (
              <div className="h-px bg-border-subtle my-2 mx-1" />
            )}
            <nav className="space-y-0.5">{group.items.map(renderItem)}</nav>
          </div>
        ))}
      </div>

      {/* Footer Logout */}
      <div className="p-3 border-t border-border-subtle bg-surface-elevated shrink-0">
        <button
          type="button"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
              window.location.href = '/login';
            }
          }}
          className={`group relative flex items-center w-full min-h-[44px] text-xs font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
          }`}
          title={isCollapsed ? 'Keluar Sesi' : undefined}
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="stroke-[2px] shrink-0" />
            {!isCollapsed && <span>Keluar Sesi</span>}
          </div>
          {!isCollapsed && <ChevronRight size={14} className="opacity-50" />}

          {/* Floating Tooltip when Collapsed */}
          {isCollapsed && (
            <div className="absolute left-16 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg z-50 whitespace-nowrap">
              Keluar Sesi
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
