'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Map, FileText, User, Database, Activity, LogOut, Users, Box, HandHeart, UserCheck, HeartHandshake, Calendar, UserPlus, ShieldAlert, GitFork } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const mainNav = [
    { label: 'Beranda', href: '/dashboard', icon: Home },
    { label: 'Hierarki GPIB', href: '/hierarki', icon: GitFork },
    { label: 'Peta', href: '/dashboard/peta', icon: Map },
    { label: 'Log Pastoral', href: '/dashboard/pastoral', icon: FileText },
  ];

  const secondaryNav = [
    { label: 'Pos Pelkes', href: '/dashboard/pos-pelkes', icon: Database },
    { label: 'Kerawanan & Potensi', href: '/wilayah', icon: ShieldAlert },
    { label: 'Demografi Pelkat', href: '/demografi', icon: Users },
    { label: 'Inventaris Aset', href: '/aset', icon: Box },
    { label: 'Pengajuan Bantuan', href: '/bantuan', icon: HandHeart },
    { label: 'Manajemen Pendeta', href: '/pendeta', icon: UserPlus },
    { label: 'Pelayan Pos', href: '/pelayan', icon: UserCheck },
    { label: 'Relawan', href: '/relawan', icon: HeartHandshake },
    { label: 'Jadwal Ibadah', href: '/jadwal', icon: Calendar },
    { label: 'Aktivitas', href: '/dashboard/aktivitas', icon: Activity },
    { label: 'Profil', href: '/dashboard/profil', icon: User },
  ];

  const renderItem = (item: any) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Link 
        key={item.href}
        href={item.href} 
        className={`flex items-center px-4 py-3 min-h-[44px] rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-50 text-brand-primary font-medium' 
            : 'text-text-muted hover:bg-gray-50 hover:text-text-high'
        }`}
      >
        <Icon size={20} className={`mr-3 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 h-screen bg-surface-elevated border-r border-gray-200 flex flex-col sticky top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Image 
          src="/logo-si-gpib.png" 
          alt="Logo SI GPIB" 
          width={32} 
          height={32} 
          className="w-8 h-8 object-contain mr-3"
        />
        <h1 className="text-xl font-bold text-brand-primary tracking-tight">SI GPIB</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div>
          <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu Utama</h2>
          <nav className="space-y-1">
            {mainNav.map(renderItem)}
          </nav>
        </div>

        <div>
          <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Manajemen</h2>
          <nav className="space-y-1">
            {secondaryNav.map(renderItem)}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center w-full px-4 py-3 min-h-[44px] text-red-600 rounded-lg hover:bg-red-50 transition-colors">
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
