'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Home,
  UserCheck,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import { useSmoothTheme } from '@/hooks/useSmoothTheme';
import { haptic } from '@/lib/haptic/vibrate';
import { NetworkStatusBadge } from '@/components/ui/NetworkStatusBadge';
import { NAV_GROUPS, NavGroup, NavItem } from '@/components/layout/Sidebar';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';

// Helper function to resolve breadcrumb crumbs from Desktop Sidebar NAV_GROUPS
function getSidebarCrumbs(pathname: string) {
  const crumbs: Array<{
    label: string;
    href: string;
    icon?: React.ElementType;
    isGroup?: boolean;
    isCurrent?: boolean;
  }> = [
    { label: 'Beranda', href: '/dashboard', icon: Home },
  ];

  if (pathname === '/' || pathname === '/dashboard') {
    crumbs[0].isCurrent = true;
    return crumbs;
  }

  // Find matching group & item from NAV_GROUPS
  let foundGroup: NavGroup | null = null;
  let foundItem: NavItem | null = null;

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (
        item.href === pathname ||
        (item.href !== '/dashboard' &&
          item.href !== '/hierarki' &&
          item.href !== '/bantuan' &&
          item.href !== '/settings' &&
          item.href !== '/laporan' &&
          pathname.startsWith(item.href + '/'))
      ) {
        foundGroup = group;
        foundItem = item;
        break;
      }
    }
    if (foundItem) break;
  }

  // Fallback for /hierarki root or subpages
  if (!foundItem && pathname.startsWith('/hierarki')) {
    foundGroup = NAV_GROUPS.find((g) => g.label === 'Hierarki') || null;
    foundItem = { label: 'Struktur Hierarki', href: '/hierarki', icon: Home };
  }

  if (foundGroup) {
    crumbs.push({
      label: foundGroup.label,
      href: foundGroup.items[0]?.href || '/dashboard',
      icon: foundGroup.icon,
      isGroup: true,
    });
  }

  if (foundItem) {
    crumbs.push({
      label: foundItem.label,
      href: foundItem.href,
      icon: foundItem.icon,
      isCurrent: pathname === foundItem.href,
    });
  }

  // Sub-route detail handling
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'hierarki' && segments.length >= 2) {
    const mupelId = decodeURIComponent(segments[1]);
    crumbs.push({
      label: mupelId,
      href: `/hierarki/${encodeURIComponent(mupelId)}`,
      isCurrent: segments.length === 2,
    });
    if (segments.length >= 3) {
      const jemaatId = decodeURIComponent(segments[2]);
      crumbs.push({
        label: jemaatId,
        href: `/hierarki/${encodeURIComponent(segments[1])}/${encodeURIComponent(jemaatId)}`,
        isCurrent: segments.length === 3,
      });
    }
    if (segments.length >= 4) {
      const posId = decodeURIComponent(segments[3]);
      crumbs.push({
        label: posId,
        href: `/hierarki/${encodeURIComponent(segments[1])}/${encodeURIComponent(segments[2])}/${encodeURIComponent(posId)}`,
        isCurrent: segments.length === 4,
      });
    }
  } else if (segments[0] === 'dashboard' && segments[1] === 'pos-pelkes' && segments.length >= 3) {
    const posId = decodeURIComponent(segments[2]);
    crumbs.push({
      label: posId,
      href: `/dashboard/pos-pelkes/${encodeURIComponent(posId)}`,
      isCurrent: true,
    });
  } else if (segments[0] === 'sdm' && segments[1] === 'pendeta' && segments.length >= 3) {
    const pendetaId = decodeURIComponent(segments[2]);
    crumbs.push({
      label: pendetaId,
      href: `/sdm/pendeta/${encodeURIComponent(pendetaId)}`,
      isCurrent: true,
    });
  } else if (segments[0] === 'bantuan' && segments.length >= 2 && segments[1] !== 'ajukan') {
    const bantuanId = decodeURIComponent(segments[1]);
    crumbs.push({
      label: `Ajuan ${bantuanId}`,
      href: `/bantuan/${encodeURIComponent(bantuanId)}`,
      isCurrent: true,
    });
  }

  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1].isCurrent = true;
  }

  return crumbs;
}

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();
  const { confirm, toast } = useToast();
  const { resolvedTheme, setTheme } = useSmoothTheme();
  const { data: currentUser } = useCurrentUser();
  const isSuperUser = isSuperUserRole(currentUser?.role);

  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'Beranda',
    'Hierarki',
    'SDM & Pelayanan',
    'Data & Laporan',
    'Bantuan',
    'Pengaturan',
  ]);

  useEffect(() => setMounted(true), []);

  // Close drawer on path change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const handleLogoutClick = () => {
    haptic.selection();
    confirm({
      title: 'Konfirmasi Keluar Sesi',
      message: 'Apakah Anda yakin ingin keluar dari akun SI GPIB?',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: async () => {
        toast.info('Mengakhiri Sesi...', 'Mengeluarkan akun dari sistem SI GPIB.');
        await logout();
      },
    });
  };

  const toggleGroup = (groupLabel: string) => {
    haptic.selection();
    setExpandedGroups((prev) =>
      prev.includes(groupLabel)
        ? prev.filter((g) => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };

  const crumbs = getSidebarCrumbs(pathname);
  const isRoot = pathname === '/dashboard' || pathname === '/';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface-1/95 backdrop-blur-md hairline-b md:hidden shadow-xs select-none">
        <div className="flex items-center justify-between min-h-[56px] px-3 pt-safe py-1">
          {/* Kiri Atas: Hamburger Menu Drawer Button + Back button + Breadcrumb Navigasi Sidebar */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
            {/* Hamburger / Sidebar Navigation Drawer Button (Kiri Atas) */}
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                setIsDrawerOpen(true);
              }}
              className="flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 active:scale-95 transition-all shrink-0 border border-brand-primary/20"
              aria-label="Buka Menu Sidebar Navigasi"
              title="Sidebar Navigasi"
            >
              <Menu size={19} className="stroke-[2.5px]" />
            </button>

            {!isRoot && (
              <button
                type="button"
                onClick={() => {
                  haptic.selection();
                  router.back();
                }}
                className="flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-ink-primary hover:bg-surface-sunken active:scale-95 transition-all shrink-0 border border-line-subtle/40"
                aria-label="Kembali"
                title="Kembali"
              >
                <ChevronLeft className="w-5 h-5 text-brand-600" />
              </button>
            )}

            {/* Breadcrumb Trail di Kiri Atas */}
            <nav
              aria-label="Breadcrumb Navigasi Sidebar"
              className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-none py-1 min-w-0"
            >
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                const IconComponent = crumb.icon;

                return (
                  <div key={`${crumb.href}-${index}`} className="flex items-center gap-1 shrink-0">
                    {index > 0 && (
                      <ChevronRight size={12} className="text-text-tertiary shrink-0" />
                    )}

                    {isLast ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs tracking-tight truncate max-w-[140px]">
                        {IconComponent && <IconComponent size={13} className="shrink-0" />}
                        <span className="truncate">{crumb.label}</span>
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        onClick={() => haptic.selection()}
                        className="inline-flex items-center gap-1 px-1 py-0.5 rounded-md text-text-muted hover:text-brand-primary font-medium text-xs transition-colors shrink-0"
                      >
                        {IconComponent && <IconComponent size={13} className="shrink-0 text-text-tertiary" />}
                        <span className="truncate max-w-[90px]">{crumb.label}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Kanan Atas: Quick Action Controls */}
          <div className="flex items-center shrink-0 gap-1.5">
            <NetworkStatusBadge />

            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              }}
              className="flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-ink-secondary hover:bg-surface-sunken active:scale-95 transition-all border border-line-subtle/40"
              aria-label="Ganti tema tampilan"
              title="Ganti Tema (Terang / Gelap)"
            >
              {mounted && resolvedTheme === 'dark' ? (
                <Sun size={17} className="text-accent-600" />
              ) : (
                <Moon size={17} className="text-brand-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Desktop-Sidebar Drawer Sheet */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-surface-elevated h-full flex flex-col shadow-heavy border-l border-border-subtle z-10 animate-slide-left">
            {/* Drawer Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center p-1">
                  <Layers className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-serif font-black text-brand-primary leading-tight">
                    SI GPIB Navigasi
                  </h2>
                  <p className="text-[10px] text-text-muted">Menu Desktop Sidebar</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-text-muted hover:text-text-high hover:bg-surface-sunken min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Groups List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {NAV_GROUPS.map((group) => {
                const validItems = group.items.filter((item) => {
                  if (item.href === '/settings/users' || item.href === '/sdm/pendeta') {
                    return isSuperUser;
                  }
                  return true;
                });

                if (validItems.length === 0) return null;

                const isExpanded = expandedGroups.includes(group.label);
                const isGroupActive = validItems.some(
                  (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                );
                const GroupIcon = group.icon;

                return (
                  <div key={group.label} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors min-h-[40px] ${
                        isGroupActive
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-surface-sunken'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <GroupIcon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{group.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="ml-3 pl-3 border-l-2 border-border-subtle/60 space-y-1 my-1">
                        {validItems.map((item) => {
                          const isItemActive =
                            item.href === '/hierarki' || item.href === '/dashboard' || item.href === '/bantuan' || item.href === '/settings' || item.href === '/laporan'
                              ? pathname === item.href
                              : pathname === item.href || pathname.startsWith(item.href + '/');
                          const ItemIcon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => {
                                haptic.selection();
                                setIsDrawerOpen(false);
                              }}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 min-h-[44px] ${
                                isItemActive
                                  ? 'bg-brand-primary text-white shadow-soft font-bold'
                                  : 'text-text-muted hover:bg-surface-sunken hover:text-text-high'
                              }`}
                            >
                              <ItemIcon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer User Info & Logout */}
            <div className="p-3 border-t border-border-subtle bg-surface-sunken/40 space-y-2 shrink-0">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCheck size={16} className="text-brand-primary shrink-0" />
                  <span className="text-xs font-bold text-text-high truncate">
                    {currentUser?.email || 'SI GPIB User'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  handleLogoutClick();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold min-h-[44px]"
              >
                <LogOut size={16} />
                <span>Keluar Sesi Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MobileHeader;
