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
  let roleBadgeClass = 'bg-stone-100 dark:bg-stone-800 text-ink-secondary border-stone-200 dark:border-stone-700';

  if (normalizedRole.includes('super')) {
    roleLabel = 'Super User Sinode';
    roleBadgeClass = 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
  } else if (normalizedRole === 'admin_mupel') {
    roleLabel = 'Admin Mupel';
    roleBadgeClass = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
  } else if (normalizedRole === 'admin_jemaat' || normalizedRole.includes('kmj')) {
    roleLabel = 'KMJ / Admin Jemaat';
    roleBadgeClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
  } else if (normalizedRole === 'pendeta') {
    roleLabel = 'Pendeta GPIB';
    roleBadgeClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  }

  return (
    <div className={cn('space-y-4 select-none w-full max-w-full overflow-hidden', className)}>
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800/80 pb-3 w-full max-w-full min-w-0">
        <nav aria-label="Breadcrumb Profil" className="flex items-center gap-1 sm:gap-1.5 text-xs text-ink-secondary font-medium min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
          <Link href="/settings" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors shrink-0">
            Pengaturan
          </Link>
          <ChevronRight size={12} className="text-ink-tertiary shrink-0" />
          <Link href="/people" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors shrink-0">
            Direktori SDM
          </Link>
          <ChevronRight size={12} className="text-ink-tertiary shrink-0" />
          <span className="font-bold text-ink-primary truncate max-w-[120px] sm:max-w-[220px] shrink-0">
            {user.nama_lengkap}
          </span>
        </nav>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:h-9 sm:w-9 rounded-xl text-ink-secondary hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all border border-stone-200/60 dark:border-stone-800 shrink-0 cursor-pointer active:scale-95 flex items-center justify-center"
            title={copied ? 'URL Disalin!' : 'Bagikan Profil'}
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
          </button>

          {viewerContext.isSelf && onEditProfile && (
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onEditProfile();
              }}
              className="px-3 py-1.5 sm:h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs shrink-0 cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Edit Profil</span>
            </button>
          )}

          {!viewerContext.isSelf && viewerContext.canViewSupervision && onChangeRole && (
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onChangeRole();
              }}
              className="px-3 py-1.5 sm:h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs shrink-0 cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>Edit Otoritas</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Identity Banner (Fluid Hero) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 w-full max-w-full min-w-0 pt-1">
        {/* Avatar */}
        <div className="relative shrink-0 self-start sm:self-center">
          {user.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.foto_url}
              alt={user.nama_lengkap}
              className="size-18 sm:size-22 rounded-3xl object-cover border border-amber-500/20 shadow-xs"
            />
          ) : (
            <div className="size-18 sm:size-22 rounded-3xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-xs border border-amber-500/20">
              {initialLetter}
            </div>
          )}
          {user.id_pendeta && (
            <span className="absolute -bottom-1 -right-1 p-1 bg-amber-600 text-white rounded-lg shadow-2xs border border-white dark:border-stone-900" title="Pendeta GPIB">
              <Crown size={12} />
            </span>
          )}
        </div>

        {/* Identity Info */}
        <div className="space-y-1.5 min-w-0 flex-1 max-w-full overflow-hidden">
          <div className="flex items-center gap-2 flex-wrap max-w-full">
            <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0', roleBadgeClass)}>
              {roleLabel}
            </span>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {user.status || 'Aktif'}
            </span>

            {user.id_pendeta && (
              <span className="text-xs font-mono font-semibold text-ink-tertiary shrink-0">
                NIP/ID: {user.id_pendeta}
              </span>
            )}
          </div>

          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight leading-tight break-words max-w-full">
            {user.nama_lengkap}
          </h1>

          <p className="text-xs sm:text-sm font-mono text-ink-secondary truncate max-w-full">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
