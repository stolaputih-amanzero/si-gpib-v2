'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Edit3, ShieldCheck, Share2, Check, Crown } from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';
import { cn } from '@/lib/utils';

export interface ProfileHeaderProps {
  user: {
    id: string;
    nama_lengkap: string;
    email: string;
    role?: string | null;
    status?: string | null;
    foto_url?: string | null;
    id_pendeta?: string | null;
    no_hp?: string | null;
  };
  viewerContext: {
    isSelf: boolean;
    canViewSupervision: boolean;
  };
  onEditProfile?: () => void;
  onChangeRole?: () => void;
  className?: string;
}

export function ProfileHeader({
  user,
  viewerContext,
  onEditProfile,
  onChangeRole,
  className,
}: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);

  const initialLetter = user.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : 'U';

  const handleShare = async () => {
    haptic.medium();
    const shareData = {
      title: `Profil 360° ${user.nama_lengkap} - GPIB`,
      text: `Profil ${user.nama_lengkap} (${user.role || 'Pengguna'})`,
      url: window.location.href,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareData.title}\n${shareData.url}`)}`,
          '_blank'
        );
      }
    }
  };

  const normalizedRole = (user.role || 'pelayan').toLowerCase();
  let roleLabel = user.role || 'Pelayan Field';
  let roleBadgeClass = 'bg-surface-sunken text-text-muted border-border-subtle';

  if (normalizedRole.includes('super')) {
    roleLabel = 'Super User Sinode';
    roleBadgeClass = 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
  } else if (normalizedRole === 'admin_mupel') {
    roleLabel = 'Admin Mupel';
    roleBadgeClass = 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
  } else if (normalizedRole === 'admin_jemaat' || normalizedRole.includes('kmj')) {
    roleLabel = 'KMJ / Admin Jemaat';
    roleBadgeClass = 'bg-brand-primary/15 text-brand-primary border-brand-primary/30';
  } else if (normalizedRole === 'pendeta') {
    roleLabel = 'Pendeta GPIB';
    roleBadgeClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  }

  return (
    <div className={cn('bg-surface-1 rounded-2xl border border-border-subtle p-4 sm:p-6 shadow-2xs space-y-4 select-none w-full max-w-full overflow-hidden', className)}>
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3 w-full max-w-full min-w-0">
        <nav aria-label="Breadcrumb Profil" className="flex items-center gap-1 sm:gap-1.5 text-xs text-text-muted font-medium min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
          <Link href="/settings" className="hover:text-brand-primary transition-colors shrink-0">
            Settings
          </Link>
          <ChevronRight size={12} className="text-text-tertiary shrink-0" />
          <Link href="/settings/users" className="hover:text-brand-primary transition-colors shrink-0">
            Users
          </Link>
          <ChevronRight size={12} className="text-text-tertiary shrink-0" />
          <span className="font-extrabold text-text-high truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[200px] shrink-0">
            {user.nama_lengkap}
          </span>
        </nav>

        {/* Top Right Action Buttons (Ghost Style on Mobile View) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:h-10 sm:w-10 rounded-xl text-text-muted hover:text-brand-primary hover:bg-surface-sunken/80 transition-all border border-transparent sm:border-border-subtle shrink-0 cursor-pointer active:scale-95"
            title={copied ? 'URL Disalin!' : 'Bagikan Profil'}
          >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
          </button>

          {viewerContext.isSelf && onEditProfile && (
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onEditProfile();
              }}
              className="px-2.5 py-1.5 sm:h-10 sm:px-3.5 rounded-xl text-brand-primary hover:bg-brand-primary/10 sm:bg-brand-primary sm:text-white sm:hover:bg-brand-primary/90 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 sm:shadow-2xs shrink-0 cursor-pointer border border-transparent sm:border-brand-primary"
            >
              <Edit3 size={16} />
              <span className="hidden xs:inline sm:inline">Edit Profil</span>
              <span className="xs:hidden">Edit</span>
            </button>
          )}

          {!viewerContext.isSelf && viewerContext.canViewSupervision && onChangeRole && (
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onChangeRole();
              }}
              className="px-2.5 py-1.5 sm:h-10 sm:px-3.5 rounded-xl text-purple-600 hover:bg-purple-500/10 sm:bg-purple-600 sm:text-white sm:hover:bg-purple-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 sm:shadow-2xs shrink-0 cursor-pointer border border-transparent sm:border-purple-600"
            >
              <ShieldCheck size={16} />
              <span className="hidden xs:inline sm:inline">Edit Organisasional</span>
              <span className="xs:hidden">Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Identity Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 w-full max-w-full min-w-0">
        {/* Avatar 80x80px */}
        <div className="relative shrink-0 self-start sm:self-center">
          {user.foto_url ? (
            <img
              src={user.foto_url}
              alt={user.nama_lengkap}
              className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-border-subtle shadow-md"
            />
          ) : (
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-white/20">
              {initialLetter}
            </div>
          )}
          {user.id_pendeta && (
            <span className="absolute -bottom-1 -right-1 p-1 bg-brand-primary text-white rounded-lg shadow-2xs border border-white" title="Pendeta GPIB">
              <Crown size={12} />
            </span>
          )}
        </div>

        {/* Identity Info */}
        <div className="space-y-1.5 min-w-0 flex-1 max-w-full overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap max-w-full">
            <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs shrink-0', roleBadgeClass)}>
              {roleLabel}
            </span>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              {user.status || 'Aktif'}
            </span>

            {user.id_pendeta && (
              <span className="text-xs font-mono font-semibold text-text-tertiary shrink-0">
                ID: {user.id_pendeta}
              </span>
            )}
          </div>

          <h1 className="font-display text-xl sm:text-3xl font-semibold text-text-high tracking-tight leading-tight break-words max-w-full">
            {user.nama_lengkap}
          </h1>

          <p className="text-xs sm:text-sm text-text-muted font-medium truncate max-w-full">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
