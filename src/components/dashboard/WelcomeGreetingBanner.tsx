'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileEdit, 
  Building2, 
  HandHeart, 
  Users, 
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/lib/haptic/vibrate';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useUserMupelAuth } from '@/hooks/use-hierarki-selector';

export interface WelcomeGreetingBannerProps {
  className?: string;
}

export const WelcomeGreetingBanner: React.FC<WelcomeGreetingBannerProps> = ({ className }) => {
  const { data: currentUser } = useCurrentUser();
  const { data: authData } = useUserMupelAuth();

  // Resolve user display name
  const rawEmail = currentUser?.email || '';
  const username = rawEmail.split('@')[0] || 'Pelayan GPIB';
  const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

  // Resolve role label & unit assignment
  const userRole = (authData?.role || currentUser?.role || '').toLowerCase().trim();

  let roleBadgeLabel = 'Pelayan Pastoral';
  let unitName = 'Sinode GPIB';

  if (currentUser?.isSuperUser) {
    roleBadgeLabel = 'Super User (Full Admin)';
    unitName = 'Seluruh Indonesia';
  } else if (userRole.includes('pj') || userRole.includes('pos')) {
    roleBadgeLabel = 'Pendeta Jemaat (PJ)';
    unitName = authData?.id_pos || authData?.id_induk || 'Pos Pelkes';
  } else if (userRole.includes('kmj') || userRole.includes('majelis')) {
    roleBadgeLabel = 'Ketua Majelis Jemaat (KMJ)';
    unitName = authData?.id_induk || 'Jemaat Induk';
  } else if (userRole.includes('mupel')) {
    roleBadgeLabel = 'Admin Mupel';
    unitName = authData?.id_mupel ? `Mupel ${authData.id_mupel}` : 'Mupel';
  } else if (authData?.id_pos) {
    roleBadgeLabel = 'Pendeta Jemaat (PJ)';
    unitName = authData.id_pos;
  } else if (authData?.id_induk) {
    roleBadgeLabel = 'Ketua Majelis Jemaat (KMJ)';
    unitName = authData.id_induk;
  }

  // 4 Integrated Quick Actions
  const quickActions = [
    {
      label: 'Log Pastoral',
      sublabel: 'Input Kegiatan',
      href: '/dashboard/aktivitas',
      icon: FileEdit,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25',
    },
    {
      label: 'Workspace Saya',
      sublabel: 'Node Penugasan',
      href: '/org/me',
      icon: Building2,
      color: 'bg-brand-primary/15 text-brand-primary hover:bg-brand-primary/25',
    },
    {
      label: 'Ajuan Bantuan',
      sublabel: 'Queue Pelayanan',
      href: '/aid-requests',
      icon: HandHeart,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25',
    },
    {
      label: 'Data Pelayan',
      sublabel: 'Direktori SDM',
      href: '/people',
      icon: Users,
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/25',
    },
  ];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-4 sm:p-6',
        'bg-gradient-to-br from-brand-primary/10 via-purple-500/5 to-amber-500/10',
        'border border-border-subtle dark:border-gray-800',
        'shadow-soft backdrop-blur-md',
        className
      )}
    >
      {/* Background Decorative Accents */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row: Identity & Role Badge */}
      <div className="relative z-10 space-y-2 mb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
            <Sparkles size={11} className="shrink-0" />
            <span>SI GPIB WORKSPACE</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-elevated text-text-muted border border-border-subtle font-semibold text-[10px] sm:text-[11px]">
            <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
            <span>{roleBadgeLabel}</span>
          </span>
        </div>

        <div>
          <h2 className="text-lg sm:text-2xl font-serif font-black text-text-high tracking-tight leading-tight">
            Selamat Datang, {formattedName}! 👋
          </h2>
          <p className="text-[11px] sm:text-xs text-text-muted mt-0.5">
            Unit Penugasan Aktif: <strong className="text-text-high font-bold">{unitName}</strong>
          </p>
        </div>
      </div>

      {/* Quick Action Grid - Mobile Optimized (No Truncation) */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => haptic('light')}
              className={cn(
                'group flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl',
                'bg-surface-elevated/90 dark:bg-gray-900/80 hover:bg-surface-elevated',
                'border border-border-subtle/70 dark:border-gray-800',
                'hover:border-brand-primary/40 hover:shadow-md',
                'transition-all duration-200 active:scale-[0.98]',
                'min-h-[48px] sm:min-h-[54px] select-none min-w-0'
              )}
            >
              <div className={cn('w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105', action.color)}>
                <IconComponent size={16} className="sm:hidden shrink-0" />
                <IconComponent size={18} className="hidden sm:block shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[11px] sm:text-xs text-text-high leading-tight group-hover:text-brand-primary transition-colors truncate">
                  {action.label}
                </p>
                <p className="text-[9px] sm:text-[10px] text-text-muted truncate hidden sm:block">
                  {action.sublabel}
                </p>
              </div>
              <ChevronRight size={13} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeGreetingBanner;
