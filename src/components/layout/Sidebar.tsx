'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import {
  Home,
  Map,
  Users,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Church,
  ChevronDown,
  ChevronRight,
  HandHeart,
  LogOut,
  UserPlus,
  UserCheck,
  HeartHandshake,
  Calendar,
  Box,
  ShieldAlert,
  Activity,
  Crown,
  GitFork,
  Database,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NetworkStatusBadge } from '@/components/ui/NetworkStatusBadge';
import { useSmoothTheme } from '@/hooks/useSmoothTheme';
import { haptic } from '@/lib/haptic/vibrate';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Beranda',
    icon: Home,
    items: [
      { label: 'Dashboard Utama', href: '/dashboard', icon: Home },
      { label: 'Analitik & KPI', href: '/analitik', icon: Activity },
    ],
  },
  {
    label: 'Hierarki',
    icon: Church,
    items: [
      { label: 'Peta Sebaran', href: '/dashboard/peta', icon: Map },
      { label: 'Struktur Hierarki', href: '/hierarki', icon: GitFork },
      { label: 'Pos Pelkes & Bajem', href: '/dashboard/pos-pelkes', icon: Database },
    ],
  },
  {
    label: 'SDM & Pelayanan',
    icon: Users,
    items: [
      { label: 'Manajemen Pendeta', href: '/sdm/pendeta', icon: UserPlus },
      { label: 'Pelayan Pos Pelkes', href: '/sdm/pelayan', icon: UserCheck },
      { label: 'Relawan', href: '/sdm/relawan', icon: HeartHandshake },
      { label: 'Jadwal Ibadah', href: '/sdm/jadwal', icon: Calendar },
    ],
  },
  {
    label: 'Data & Laporan',
    icon: FileText,
    items: [
      { label: 'Log Pastoral', href: '/laporan/pastoral', icon: FileText },
      { label: 'Demografi Pelkat', href: '/laporan/demografi', icon: Users },
      { label: 'Inventaris Aset', href: '/laporan/aset', icon: Box },
      { label: 'Kerawanan Wilayah', href: '/laporan/kerawanan', icon: ShieldAlert },
      { label: 'Potensi Wilayah', href: '/laporan/potensi', icon: ShieldAlert },
    ],
  },
  {
    label: 'Bantuan',
    icon: HandHeart,
    items: [
      { label: 'Daftar Pengajuan', href: '/bantuan', icon: HandHeart },
      { label: 'Ajukan Bantuan Baru', href: '/bantuan/ajukan', icon: HandHeart },
    ],
  },
  {
    label: 'Pengaturan',
    icon: Settings,
    items: [
      { label: 'Profil 360° Saya', href: '/settings/profile', icon: UserCheck },
      { label: 'Pengaturan Sistem', href: '/settings', icon: Settings },
      { label: 'Manajemen User & Role', href: '/settings/users', icon: Crown },
    ],
  },
];

import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();
  const { confirm, toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const isSuperUser = isSuperUserRole(currentUser?.role);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'Beranda',
    'Hierarki',
    'SDM & Pelayanan',
    'Data & Laporan',
    'Bantuan',
    'Pengaturan',
  ]);

  const { resolvedTheme, setTheme } = useSmoothTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupLabel)
        ? prev.filter((g) => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };

  const handleLogoutClick = () => {
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

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-surface-elevated border-r border-border-subtle sticky top-0 left-0 z-30 select-none transition-all duration-300 ease-in-out shrink-0 shadow-soft',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-border-subtle shrink-0 px-4 transition-all duration-300',
          isCollapsed ? 'justify-center px-2' : 'justify-between'
        )}
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
              <h1 className="text-base font-serif font-black text-brand-primary leading-tight tracking-tight truncate">
                SI GPIB
              </h1>
              <p className="text-[10px] font-medium text-text-muted truncate">
                Pos Pelayanan & Kesaksian
              </p>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <Link href="/dashboard" className="p-1 rounded-xl group" title="SI GPIB Beranda">
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

        {/* Action Control: Collapse Toggle */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="p-2 rounded-xl text-text-muted hover:text-text-high hover:bg-surface-sunken active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          aria-label={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} className="text-brand-primary" />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-3 scrollbar-thin">
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

          if (isCollapsed) {
            return (
              <div key={group.label} className="group relative flex flex-col items-center my-1">
                <button
                  type="button"
                  onClick={() => router.push(validItems[0].href)}
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl transition-all min-h-[44px]',
                    isGroupActive
                      ? 'bg-brand-primary/15 text-brand-primary font-bold shadow-soft'
                      : 'text-text-muted hover:bg-surface-sunken hover:text-text-high'
                  )}
                  aria-label={group.label}
                >
                  <GroupIcon className="w-5 h-5" />
                </button>
                {/* Floating Tooltip */}
                <div className="absolute left-16 top-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-heavy z-50 whitespace-nowrap">
                  {group.label}
                </div>
              </div>
            );
          }

          return (
            <div key={group.label} className="space-y-1">
              {/* Group Header Button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors min-h-[40px]',
                  isGroupActive
                    ? 'text-brand-primary bg-brand-primary/5'
                    : 'text-text-muted hover:text-text-high hover:bg-surface-sunken'
                )}
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

              {/* Group Sub-Items */}
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
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 min-h-[44px]',
                          isItemActive
                            ? 'bg-brand-primary text-white shadow-soft font-bold'
                            : 'text-text-muted hover:bg-surface-sunken hover:text-text-high'
                        )}
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
      </nav>

      {/* Footer System & Profile Controls */}
      <div className="border-t border-border-subtle p-3 shrink-0 bg-surface-sunken/40 space-y-2">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* Status & User Profile Row */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <NetworkStatusBadge />
                <span className="text-[11px] font-bold text-text-high truncate">
                  {currentUser?.email || 'SI GPIB System'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons: Theme Toggle & Logout */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  haptic.selection();
                  setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-border-subtle bg-surface-elevated hover:bg-surface-sunken text-text-high text-xs font-semibold active:scale-95 transition-all min-h-[40px]"
                aria-label="Ganti tema tampilan"
                title="Ganti Tema Tampilan (Terang / Gelap)"
              >
                {mounted && resolvedTheme === 'dark' ? (
                  <>
                    <Sun size={15} className="text-amber-500 shrink-0" />
                    <span>Terang</span>
                  </>
                ) : (
                  <>
                    <Moon size={15} className="text-brand-primary shrink-0" />
                    <span>Gelap</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 text-xs font-semibold active:scale-95 transition-all min-h-[40px]"
                aria-label="Keluar Sesi Akun"
                title="Keluar Sesi Akun (Logout)"
              >
                <LogOut size={15} className="shrink-0" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed Mode Stacked Icons */
          <div className="flex flex-col items-center gap-2">
            <NetworkStatusBadge />
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              }}
              className="p-2 rounded-xl text-text-muted hover:text-text-high hover:bg-surface-sunken active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center border border-border-subtle"
              aria-label="Ganti tema"
              title="Ganti Tema (Terang / Gelap)"
            >
              {mounted && resolvedTheme === 'dark' ? (
                <Sun size={18} className="text-amber-500" />
              ) : (
                <Moon size={18} className="text-brand-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center border border-red-200/50 dark:border-red-900/30"
              aria-label="Keluar Sesi Akun"
              title="Keluar Sesi Akun (Logout)"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
