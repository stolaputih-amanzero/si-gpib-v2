'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Search, LogOut, ChevronRight } from 'lucide-react';
import { NAVIGATION_GROUPS, NavItem } from '@/lib/constants/navigation';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredGroups = NAVIGATION_GROUPS.map((group) => {
    if (!searchQuery.trim()) return group;
    const filteredItems = group.items.filter(
      (item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end sm:justify-start">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-sm bg-surface-elevated h-[88vh] sm:h-full flex flex-col shadow-2xl rounded-t-2xl sm:rounded-none overflow-hidden z-10 transition-transform duration-300 animate-in slide-in-from-bottom sm:slide-in-from-left"
      >
        {/* Mobile Handle Pill (Visual affordance for bottom sheet) */}
        <div className="w-12 h-1.5 bg-border-strong/60 rounded-full mx-auto my-2 shrink-0 sm:hidden" />

        {/* Drawer Header */}
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-surface-elevated shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center p-1.5 shrink-0">
              <Image
                src="/logo-si-gpib.png"
                alt="Logo SI GPIB"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-sm font-black text-brand-primary tracking-tight">SI GPIB Navigation</h2>
              <p className="text-[10px] font-medium text-text-muted">Pos Pelayanan Kesaksian</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-high hover:bg-surface-sunken active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center border border-border-subtle/60"
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar inside Drawer */}
        <div className="p-3 border-b border-border-subtle bg-surface-sunken/40 shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu pelayanan, aset, log..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-elevated border border-border-subtle text-text-high placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-xs text-text-muted hover:text-text-high px-1.5 py-0.5 rounded-md bg-surface-sunken"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-xs font-semibold text-text-muted">Menu &quot;{searchQuery}&quot; tidak ditemukan</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                    {group.title}
                  </h3>
                  <span className="text-[10px] font-medium text-text-disabled bg-surface-sunken px-1.5 py-0.5 rounded-md">
                    {group.items.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {group.items.map((item: NavItem) => {
                    const isActive =
                      pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`group flex items-center justify-between p-3 rounded-xl min-h-[48px] transition-all ${
                          isActive
                            ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-xs'
                            : 'bg-surface-sunken/40 text-text-high hover:bg-surface-sunken border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isActive
                                ? 'bg-brand-primary text-white'
                                : 'bg-surface-elevated text-text-muted group-hover:text-brand-primary border border-border-subtle'
                            }`}
                          >
                            <Icon size={18} className="stroke-[2px]" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold truncate">{item.label}</span>
                              {item.badge && (
                                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded-full bg-brand-primary/15 text-brand-primary">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-text-muted truncate mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                            isActive ? 'text-brand-primary' : 'text-text-muted opacity-50'
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-border-subtle bg-surface-elevated shrink-0 space-y-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
                window.location.href = '/login';
              }
            }}
            className="flex items-center justify-between w-full min-h-[44px] px-3.5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl transition-colors border border-red-200/50 dark:border-red-900/30"
          >
            <div className="flex items-center gap-2.5">
              <LogOut size={16} className="stroke-[2px]" />
              <span>Keluar Sesi</span>
            </div>
            <ChevronRight size={14} className="opacity-50" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileDrawer;
