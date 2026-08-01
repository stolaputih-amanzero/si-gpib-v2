'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProfileAkun, useProfilePelayanan } from '@/hooks/use-profile';
import { RoleBadge } from './RoleBadge';
import { CopyableContact } from './CopyableContact';
import {
  Mail,
  Phone,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  X,
  User,
  Award,
  ExternalLink,
} from 'lucide-react';
import { cn, formatWhatsAppUrl } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { differenceInYears } from 'date-fns';

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

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);

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

  const rawAvatar = akun?.avatar_url || akun?.foto_url || (mode === 'self' ? userAvatarUrl : null) || pelayanan?.foto_url || localStorageAvatar;
  const avatarUrl = rawAvatar && rawAvatar.trim() !== '' ? rawAvatar : null;
  const email = pelayanan?.email || akun?.email;
  const phone = pelayanan?.no_telepon || akun?.no_hp;

  const age = pelayanan?.tgl_lahir ? differenceInYears(new Date(), new Date(pelayanan.tgl_lahir)) : null;

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatarUrl) {
      setIsPhotoPreviewOpen(true);
    } else {
      setIsDetailModalOpen(true);
    }
  };

  return (
    <>
      {/* Clickable Profile Hero Header */}
      <div
        onClick={() => setIsDetailModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsDetailModalOpen(true);
          }
        }}
        className={cn(
          'relative overflow-hidden rounded-2xl elevate-2 p-5 sm:p-6 transition-all animate-rise cursor-pointer group hover:border-brand-500/50 hover:shadow-md active:scale-[0.995]',
          glowClass
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Left: Avatar & Identity Details */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {/* Clickable Photo Avatar */}
            <div
              onClick={handleAvatarClick}
              role="button"
              tabIndex={0}
              title={avatarUrl ? 'Klik untuk preview foto profil' : 'Foto Profil'}
              className="w-16 h-16 rounded-2xl bg-surface-brand text-brand-600 flex items-center justify-center font-display text-2xl font-bold overflow-hidden shrink-0 border border-brand-500/20 shadow-soft animate-pop relative cursor-pointer hover:opacity-90 hover:ring-4 hover:ring-brand-500/30 active:scale-95 transition-all"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary group-hover:text-brand-600 transition-colors truncate leading-tight">
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

          {/* Right: Chevron indicator for opening details */}
          <div className="flex items-center gap-1 text-ink-tertiary group-hover:text-brand-600 transition-colors shrink-0 self-end sm:self-start pt-1">
            <span className="text-xs font-semibold hidden sm:inline">Rincian Profil</span>
            <div className="p-2 rounded-xl bg-surface-sunken group-hover:bg-brand-500/10 transition-colors">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>

        {/* Bottom Row: Copyable Contacts */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 mt-4 border-t border-line-hairline"
          onClick={(e) => e.stopPropagation()}
        >
          <CopyableContact icon={Mail} value={email} label="Email" className="w-full sm:w-auto" />
          <CopyableContact icon={Phone} value={phone} label="No. Telepon / WA" className="w-full sm:w-auto" />
        </div>
      </div>

      {/* Modal Detail Profil */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface-elevated rounded-t-3xl sm:rounded-3xl p-6 space-y-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header Detail Modal */}
            <div className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => avatarUrl && setIsPhotoPreviewOpen(true)}
                  className={cn(
                    'w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-brand-primary/20 shadow-soft',
                    avatarUrl && 'cursor-pointer hover:opacity-90 hover:ring-4 hover:ring-brand-500/30 transition-all'
                  )}
                  title={avatarUrl ? 'Klik untuk preview foto profil' : 'Foto Profil'}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <RoleBadge role={role} />
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-ok-soft text-ok border border-ok/20">
                      {akun?.status || 'Active'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-primary mt-1">{displayName}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high shrink-0 min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rincian Biodata Pengguna & Pelayanan */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-surface-sunken rounded-2xl border border-border-subtle space-y-3">
                <h4 className="font-bold text-text-high text-xs uppercase tracking-wider flex items-center gap-1.5 text-brand-primary">
                  <User size={14} />
                  <span>Informasi Akun Pengguna</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted font-medium block">Nama Lengkap</span>
                    <span className="font-semibold text-text-high mt-0.5 block">{displayName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted font-medium block">Email Terdaftar</span>
                    <span className="font-mono text-text-high mt-0.5 block truncate">{email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted font-medium block">No. Telepon / WA</span>
                    {phone ? (
                      <a
                        href={formatWhatsAppUrl(phone) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 inline-flex items-center gap-1.5"
                        title="Hubungi via WhatsApp"
                      >
                        <Phone size={13} />
                        <span>{phone}</span>
                        <ExternalLink size={11} className="opacity-75" />
                      </a>
                    ) : (
                      <span className="font-mono text-text-high mt-0.5 block">-</span>
                    )}
                  </div>
                  <div>
                    <span className="text-text-muted font-medium block">Akses Role</span>
                    <span className="font-semibold text-brand-primary mt-0.5 block uppercase">{role}</span>
                  </div>
                </div>
              </div>

              {/* Rincian Identitas Pelayanan (jika Pendeta) */}
              {pelayanan && (
                <div className="p-4 bg-surface-sunken rounded-2xl border border-border-subtle space-y-3">
                  <h4 className="font-bold text-text-high text-xs uppercase tracking-wider flex items-center gap-1.5 text-purple-600">
                    <Award size={14} />
                    <span>Identitas Pelayanan Pendeta</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-text-muted font-medium block">NIP / NIK</span>
                      <span className="font-mono font-medium text-text-high mt-0.5 block">
                        NIP: {pelayanan.nip || '-'} | NIK: {pelayanan.nik || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-text-muted font-medium block">Tempat / Tanggal Lahir</span>
                      <span className="font-mono text-text-high mt-0.5 block">
                        {pelayanan.tempat_lahir ? `${pelayanan.tempat_lahir}, ` : ''}
                        {pelayanan.tgl_lahir
                          ? new Date(pelayanan.tgl_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-'}
                        {age !== null && <strong className="text-brand-600 font-sans ml-1">({age} thn)</strong>}
                      </span>
                    </div>

                    <div>
                      <span className="text-text-muted font-medium block">Jenis Kelamin</span>
                      <span className="font-semibold text-text-high mt-0.5 block">
                        {pelayanan.jenis_kelamin || '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-text-muted font-medium block">Mulai Tugas GPIB</span>
                      <span className="font-mono text-text-high mt-0.5 block">
                        {pelayanan.tgl_tugas_awal
                          ? new Date(pelayanan.tgl_tugas_awal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-text-muted font-medium block">Mupel</span>
                      {pelayanan.mupel_nama ? (
                        <Link
                          href={
                            pelayanan.id_mupel
                              ? `/hierarki/${encodeURIComponent(pelayanan.id_mupel)}`
                              : `/hierarki?search=${encodeURIComponent(pelayanan.mupel_nama.replace(/^Mupel\s+/i, ''))}`
                          }
                          onClick={() => setIsDetailModalOpen(false)}
                          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-0.5 inline-flex items-center gap-1 group"
                          title={`Lihat Detail Mupel ${pelayanan.mupel_nama}`}
                        >
                          <span>{pelayanan.mupel_nama.replace(/^Mupel\s+/i, '')}</span>
                          <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ) : (
                        <span className="font-semibold text-text-muted mt-0.5 block">-</span>
                      )}
                    </div>

                    <div>
                      <span className="text-text-muted font-medium block">Jemaat Induk</span>
                      {pelayanan.jemaat_induk_nama ? (
                        <Link
                          href={
                            pelayanan.id_induk
                              ? `/hierarki/${encodeURIComponent(pelayanan.id_mupel || 'all')}/${encodeURIComponent(pelayanan.id_induk)}`
                              : `/hierarki?search=${encodeURIComponent(pelayanan.jemaat_induk_nama)}`
                          }
                          onClick={() => setIsDetailModalOpen(false)}
                          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-0.5 inline-flex items-center gap-1 group"
                          title={`Lihat Detail Jemaat Induk ${pelayanan.jemaat_induk_nama}`}
                        >
                          <span>{pelayanan.jemaat_induk_nama}</span>
                          <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ) : (
                        <span className="font-semibold text-text-muted mt-0.5 block">-</span>
                      )}
                    </div>

                    {pelayanan.pos_pelkes_nama && (
                      <div className="sm:col-span-2">
                        <span className="text-text-muted font-medium block">Pos Pelkes / Bajem Penugasan</span>
                        <Link
                          href={
                            pelayanan.id_pos
                              ? `/dashboard/pos-pelkes/${encodeURIComponent(pelayanan.id_pos)}`
                              : '/dashboard/pos-pelkes'
                          }
                          onClick={() => setIsDetailModalOpen(false)}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 inline-flex items-center gap-1 group"
                          title={`Lihat Detail Pos Pelkes ${pelayanan.pos_pelkes_nama}`}
                        >
                          <span>{pelayanan.pos_pelkes_nama}</span>
                          <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Buttons: Edit Profil Moved Here */}
            <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
              {onEditProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    onEditProfile();
                  }}
                  className="flex-1 min-h-[44px] px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs"
                >
                  <Edit3 size={16} />
                  <span>Edit Profil</span>
                </button>
              )}

              {mode === 'supervise' && onChangeRole && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    onChangeRole();
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                >
                  <ShieldCheck size={16} />
                  <span>Ubah Peran</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="min-h-[44px] px-4 rounded-xl border border-border-subtle bg-surface-sunken text-text-high font-semibold text-xs hover:bg-surface-elevated transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal Preview Foto Profil */}
      {isPhotoPreviewOpen && avatarUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsPhotoPreviewOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white pb-1">
              <span className="text-sm font-bold truncate">Foto Profil - {displayName}</span>
              <button
                type="button"
                onClick={() => setIsPhotoPreviewOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                title="Tutup Preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative max-h-[80vh] w-full flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-black/40 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
              />
            </div>

            <p className="text-xs text-white/70 italic text-center">Klik di luar gambar atau tombol X untuk menutup</p>
          </div>
        </div>
      )}
    </>
  );
}
