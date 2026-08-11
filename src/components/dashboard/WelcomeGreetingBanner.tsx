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
  let roleBadgeLabel = 'Pelayan Pastoral';
  let unitName = 'Sinode GPIB';

  if (currentUser?.isSuperUser) {
    roleBadgeLabel = 'Super User (Full Admin)';
    unitName = 'Seluruh Indonesia';
  } else if (authData?.id_pos) {
    roleBadgeLabel = 'Penanggung Jawab Pos';
    unitName = authData.id_pos;
  } else if (authData?.id_induk) {
    roleBadgeLabel = 'Ketua Majelis Jemaat';
    unitName = authData.id_induk;
  } else if (authData?.id_mupel) {
    roleBadgeLabel = 'Admin Mupel';
    unitName = `Mupel ${authData.id_mupel}`;
  }

  // 4 Integrated Quick Actions
  const quickActions = [
    {
      label: 'Log Pastoral',
      sublabel: 'Input Kegiatan',
      href: '/dashboard/aktivitas',
      icon: FileEdit,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20',
    },
    {
      label: 'Workspace Saya',
      sublabel: 'Node Penugasan',
      href: '/org/me',
      icon: Building2,
      color: 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20',
    },
    {
      label: 'Ajuan Bantuan',
      sublabel: 'Queue Pelayanan',
      href: '/aid-requests',
      icon: HandHeart,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
    },
    {
      label: 'Data Pelayan',
      sublabel: 'Direktori SDM',
      href: '/people',
      icon: Users,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20',
    },
  ];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-5 sm:p-6',
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
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary font-bold text-[11px] uppercase tracking-wider">
              <Sparkles size={12} className="shrink-0" />
              <span>SI GPIB Workspace</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-elevated text-text-muted border border-border-subtle font-semibold text-[11px]">
              <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
              <span>{roleBadgeLabel}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-black text-text-high tracking-tight">
            Selamat Datang, {formattedName}! 👋
          </h2>
          <p className="text-xs text-text-muted">
            Unit Penugasan Aktif: <strong className="text-text-high font-bold">{unitName}</strong>
          </p>
        </div>
      </div>

      {/* Quick Action Grid Integrated Directly Inside Banner */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => haptic('light')}
              className={cn(
                'group flex items-center justify-between p-3 rounded-2xl',
                'bg-surface-elevated/90 dark:bg-gray-900/80 hover:bg-surface-elevated',
                'border border-border-subtle/70 dark:border-gray-800',
                'hover:border-brand-primary/40 hover:shadow-md',
                'transition-all duration-200 active:scale-[0.98]',
                'min-h-[56px] select-none'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105', action.color)}>
                  <IconComponent size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-text-high truncate group-hover:text-brand-primary transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-text-muted truncate">
                    {action.sublabel}
                  </p>
                </div>
              </div>

              <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeGreetingBanner;
