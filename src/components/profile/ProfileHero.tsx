'use client';

import { useProfileAkun, useProfilePelayanan } from '@/hooks/use-profile';
import { RoleBadge } from './RoleBadge';
import { CopyableContact } from './CopyableContact';
import { Mail, Phone, Edit3, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useUser } from '@/hooks/use-user';

interface ProfileHeroProps {
  userId?: string;
  mode?: 'self' | 'supervise';
  onEditProfile?: () => void;
  onChangeRole?: () => void;
}

export function ProfileHero({ userId, mode = 'self', onEditProfile, onChangeRole }: ProfileHeroProps) {
  const { data: akun, isLoading: isAkunLoading } = useProfileAkun(userId);
  const { data: pelayanan, isLoading: isPelayananLoading } = useProfilePelayanan(akun?.id_pendeta);
  const { avatarUrl: userAvatarUrl } = useUser();

  if (isAkunLoading || isPelayananLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl elevate-2 p-5 sm:p-6 bg-surface-1 animate-pulse space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-sunken shrink-0 skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-surface-sunken rounded w-48 skeleton" />
            <div className="h-4 bg-surface-sunken rounded w-32 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  const role = akun?.role || 'pelayan';
  let glowClass = 'glow-user';
  if (['super_user', 'superadmin', 'sinode'].includes(role)) glowClass = 'glow-super';
  else if (role === 'admin_mupel') glowClass = 'glow-admin';
  else if (role === 'kmj' || role === 'admin_jemaat') glowClass = 'glow-kmj';

  // Format initials
  const displayName = pelayanan?.nama_pendeta || akun?.nama_lengkap || akun?.email || 'Pengguna SI GPIB';
  const getInitials = (name: string) => {
    const parts = name.replace(/^(Pdt\.|Pdt|Ev\.|St\.|Dkn\.)\s+/i, '').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.substring(0, 2) || 'GP').toUpperCase();
  };

  const initials = getInitials(displayName);

  let localStorageAvatar: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('si_gpib_cached_user') || localStorage.getItem('si_gpib_cached_current_user');
      if (cached) {
        const obj = JSON.parse(cached);
        localStorageAvatar = obj.avatar_url || obj.foto_url || obj.user_metadata?.avatar_url || obj.user_metadata?.foto_url || null;
      }
    } catch {}
  }

  const avatarUrl = akun?.avatar_url || akun?.foto_url || pelayanan?.foto_url || (mode === 'self' ? userAvatarUrl : null) || localStorageAvatar;
  const email = pelayanan?.email || akun?.email;
  const phone = pelayanan?.no_telepon || akun?.no_hp;

  return (
    <div className={cn('relative overflow-hidden rounded-2xl elevate-2 p-5 sm:p-6 transition-all animate-rise', glowClass)}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-surface-brand text-brand-600 flex items-center justify-center font-display text-2xl font-bold overflow-hidden shrink-0 border border-brand-500/20 shadow-soft animate-pop relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary truncate leading-tight">
                {displayName}
              </h1>
              {pelayanan?.gelar_belakang && (
                <span className="text-xs text-ink-tertiary font-mono">({pelayanan.gelar_belakang})</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <RoleBadge role={role} />

              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-ok-soft text-ok border border-ok/20">
                <CheckCircle2 size={12} />
                <span>{akun?.status || 'Active'}</span>
              </span>

              {pelayanan?.is_kmj && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  KMJ Active
                </span>
              )}
              {pelayanan?.is_pj && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  PJ Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions Menu */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
          {mode === 'supervise' && onChangeRole && (
            <button
              type="button"
              onClick={onChangeRole}
              className="h-12 px-4 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 active:scale-95 transition-all shadow-soft inline-flex items-center gap-1.5 min-h-[48px]"
            >
              <ShieldCheck size={18} />
              <span>Ubah Peran</span>
            </button>
          )}

          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              className="h-12 w-12 rounded-xl bg-surface-sunken hover:bg-surface-brand text-ink-primary hover:text-brand-600 border border-line-subtle transition-all tap flex items-center justify-center min-h-[48px] min-w-[48px]"
              title="Edit Profile"
            >
              <Edit3 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Copyable Contacts */}
      <div className="flex items-center gap-2.5 flex-wrap pt-4 mt-4 border-t border-line-hairline">
        <CopyableContact icon={Mail} value={email} label="Email" />
        <CopyableContact icon={Phone} value={phone} label="No. Telepon / WA" />
      </div>
    </div>
  );
}
