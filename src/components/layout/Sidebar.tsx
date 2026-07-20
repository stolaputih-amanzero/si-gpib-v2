'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Map,
  FileText,
  User,
  Database,
  Activity,
  LogOut,
  Users,
  Box,
  HandHeart,
  UserCheck,
  HeartHandshake,
  Calendar,
  UserPlus,
  ShieldAlert,
  GitFork,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();

  const navigationGroups: NavGroup[] = [
    {
      title: 'Utama',
      items: [
        { label: 'Beranda', href: '/dashboard', icon: Home },
        { label: 'Analitik & KPI', href: '/analitik', icon: BarChart3, badge: 'Baru' },
        { label: 'Peta Sebaran', href: '/dashboard/peta', icon: Map },
        { label: 'Hierarki GPIB', href: '/hierarki', icon: GitFork },
      ],
    },
    {
      title: 'Pelayanan Pos',
      items: [
        { label: 'Pos Pelkes & Bajem', href: '/dashboard/pos-pelkes', icon: Database },
        { label: 'Log Pastoral', href: '/dashboard/pastoral', icon: FileText },
        { label: 'Kerawanan & Potensi', href: '/wilayah', icon: ShieldAlert },
        { label: 'Demografi Pelkat', href: '/demografi', icon: Users },
        { label: 'Jadwal Ibadah', href: '/jadwal', icon: Calendar },
      ],
    },
    {
      title: 'Sumber Daya & Aset',
      items: [
        { label: 'Pengajuan Bantuan', href: '/bantuan', icon: HandHeart },
        { label: 'Inventaris Aset', href: '/aset', icon: Box },
        { label: 'Manajemen Pendeta', href: '/pendeta', icon: UserPlus },
        { label: 'Pelayan Pos', href: '/pelayan', icon: UserCheck },
        { label: 'Relawan', href: '/relawan', icon: HeartHandshake },
      ],
    },
    {
      title: 'Sistem & Akun',
      items: [
        { label: 'Aktivitas Log', href: '/dashboard/aktivitas', icon: Activity },
        { label: 'Profil Saya', href: '/dashboard/profil', icon: User },
      ],
    },
  ];

  const renderItem = (item: NavItem) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group relative flex items-center justify-between px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all duration-150 ${
          isActive
            ? 'bg-brand-primary/10 text-brand-primary font-bold shadow-xs'
            : 'text-text-muted hover:bg-surface-sunken hover:text-text-high'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            size={18}
            className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${
              isActive ? 'text-brand-primary stroke-[2.5px]' : 'text-text-muted stroke-[1.8px]'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {item.badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-brand-primary/15 text-brand-primary">
            {item.badge}
          </span>
        )}

        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-primary rounded-r-full" />
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 h-screen bg-surface-elevated border-r border-border-subtle flex flex-col sticky top-0 left-0 z-30 select-none">
      {/* Header Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border-subtle shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
            <Image
              src="/logo-si-gpib.png"
              alt="Logo SI GPIB"
              width={28}
              height={28}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-black text-brand-primary leading-tight tracking-tight">SI GPIB</h1>
            <p className="text-[10px] font-medium text-text-muted">Pos Pelayanan Kesaksian</p>
          </div>
        </Link>
        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
          v2.2
        </span>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h2 className="px-3 text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5">
              {group.title}
            </h2>
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
          className="flex items-center justify-between w-full px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="stroke-[2px]" />
            <span>Keluar Sesi</span>
          </div>
          <ChevronRight size={14} className="opacity-50" />
        </button>
      </div>
    </aside>
  );
}
