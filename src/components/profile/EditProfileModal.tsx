'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import { updateOwnProfileAction } from '@/app/(dashboard)/settings/actions';
import { useQueryClient } from '@tanstack/react-query';
import { User as UserIcon, Camera, Image as ImageIcon, RefreshCw, X } from 'lucide-react';
import { compressAvatarImage } from '@/lib/camera/compress';
import { useProfileAkun, useProfilePelayanan } from '@/hooks/use-profile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: { avatar_url?: string; email?: string; nama_lengkap?: string }) => void;
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { user, nama: userNama, email: userEmail, avatarUrl: userAvatarUrl } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: akun } = useProfileAkun(user?.id);
  const { data: pelayanan } = useProfilePelayanan(akun?.id_pendeta);

  const [editNama, setEditNama] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNoHp, setEditNoHp] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const phoneValue =
      pelayanan?.no_telepon ||
      akun?.no_hp ||
      user?.no_telepon ||
      user?.no_hp ||
      user?.user_metadata?.no_telepon ||
      user?.user_metadata?.no_hp ||
      '';

    let currentAvatar =
      akun?.avatar_url ||
      akun?.foto_url ||
      pelayanan?.foto_url ||
      userAvatarUrl ||
      user?.avatar_url ||
      user?.foto_url ||
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.foto_url ||
      user?.user_metadata?.picture ||
      '';

    if (!currentAvatar && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('si_gpib_cached_user') || localStorage.getItem('si_gpib_cached_current_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          currentAvatar =
            parsed.avatar_url ||
            parsed.foto_url ||
            parsed.user_metadata?.avatar_url ||
            parsed.user_metadata?.foto_url ||
            parsed.user_metadata?.picture ||
            '';
        }
      } catch {}
    }

    setEditNama(pelayanan?.nama_pendeta || akun?.nama_lengkap || userNama || user?.user_metadata?.nama_lengkap || '');
    setEditEmail(userEmail || user?.email || '');
    setEditNoHp(phoneValue);
    setEditAvatar(currentAvatar || '');
  }, [isOpen, user, akun, pelayanan, userNama, userEmail, userAvatarUrl]);

  if (!isOpen) return null;

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const rawFile = files[0];

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
    if (rawFile.size > MAX_SIZE_BYTES) {
      toast.error('Ukuran Foto Terlalu Besar', 'Maksimal ukuran foto profil yang diperbolehkan adalah 5 MB.');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      return;
    }

    setIsCompressingAvatar(true);
    try {
      const compressed = await compressAvatarImage(rawFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditAvatar(base64);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Error processing avatar image:', err);
      toast.error('Gagal Memuat Foto', 'Foto tidak dapat diproses, silakan coba foto lain.');
    } finally {
      setIsCompressingAvatar(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNama.trim()) {
      toast.error('Nama Wajib Diisi', 'Silakan masukkan nama lengkap Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateOwnProfileAction({
        nama_lengkap: editNama.trim(),
        email: editEmail.trim(),
        no_hp: editNoHp.trim(),
        avatar_url: editAvatar.trim(),
      });

      if (!res.success) {
        throw new Error(res.error || 'Gagal menyimpan data profil.');
      }

      const updatedAvatar = res.avatar_url?.trim() || editAvatar.trim() || null;

      // Synchronize local storage caches immediately for fast UI feedback
      try {
        const cachedUser = localStorage.getItem('si_gpib_cached_user');
        const parsed = cachedUser ? JSON.parse(cachedUser) : {};
        parsed.avatar_url = updatedAvatar;
        parsed.foto_url = updatedAvatar;
        parsed.nama_lengkap = editNama.trim();
        parsed.user_metadata = {
          ...(parsed.user_metadata || {}),
          avatar_url: updatedAvatar,
          foto_url: updatedAvatar,
          picture: updatedAvatar,
          nama_lengkap: editNama.trim(),
        };
        localStorage.setItem('si_gpib_cached_user', JSON.stringify(parsed));

        const cachedCurr = localStorage.getItem('si_gpib_cached_current_user');
        const parsedCurr = cachedCurr ? JSON.parse(cachedCurr) : {};
        parsedCurr.nama_lengkap = editNama.trim();
        parsedCurr.avatar_url = updatedAvatar;
        parsedCurr.foto_url = updatedAvatar;
        localStorage.setItem('si_gpib_cached_current_user', JSON.stringify(parsedCurr));
      } catch {}

      toast.success('Profil Diperbarui', 'Data profil Anda berhasil disimpan.');

      // Invalidate all related profile & auth queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile-akun'] }),
        queryClient.invalidateQueries({ queryKey: ['profile-pelayanan'] }),
        queryClient.invalidateQueries({ queryKey: ['current-user-auth'] }),
        queryClient.invalidateQueries({ queryKey: ['user-me'] }),
      ]);

      if (onSuccess) {
        onSuccess({
          avatar_url: updatedAvatar || undefined,
          email: editEmail.trim(),
          nama_lengkap: editNama.trim(),
        });
      }

      onClose();
    } catch (err: any) {
      toast.error('Gagal Simpan Profil', err?.message || 'Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-surface-elevated w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div>
            <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
              <UserIcon size={18} />
              <span>Edit Profil Pengguna</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Perbarui foto profil, nama lengkap, dan kontak Anda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* 1. Foto Profil / Avatar Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-high">Foto Profil / Avatar</label>
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-surface-sunken border border-border-subtle">
              {/* Avatar Preview */}
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-brand-primary/20 relative group">
                {editAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editAvatar} alt="Preview Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-brand-primary" />
                )}
                {editAvatar && (
                  <button
                    type="button"
                    onClick={() => setEditAvatar('')}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus Foto"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Buttons: Kamera & Galeri */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isCompressingAvatar}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all min-h-[40px] disabled:opacity-50"
                  >
                    {isCompressingAvatar ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                    <span>Kamera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isCompressingAvatar}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-elevated text-text-high border border-border-subtle hover:bg-surface-sunken text-xs font-bold active:scale-95 transition-all min-h-[40px] disabled:opacity-50"
                  >
                    <ImageIcon size={14} className="text-brand-primary" />
                    <span>Galeri</span>
                  </button>
                </div>
                <p className="text-[10px] text-text-muted truncate">Kamera HP / foto galeri (Maksimal 5 MB, Kompres HD)</p>
              </div>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />
          </div>

          {/* 2. Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Nama Lengkap *</label>
            <input
              type="text"
              placeholder="Contoh: Pdt. Otniel Jonatan"
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
              required
            />
          </div>

          {/* 3. Email Terdaftar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Email Terdaftar *</label>
            <input
              type="email"
              placeholder="Contoh: user@gpib.or.id"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono min-h-[44px]"
              required
            />
          </div>

          {/* 4. Role & Otorisasi (Read Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted">Role & Otorisasi Akses</label>
            <input
              type="text"
              value={(akun?.role || user?.role || user?.user_metadata?.role || 'PELAYAN')?.toUpperCase()}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-sunken text-sm font-extrabold text-brand-primary cursor-not-allowed uppercase min-h-[44px]"
            />
          </div>

          {/* 5. Nomor Telepon / WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Nomor Telepon / WhatsApp</label>
            <input
              type="tel"
              placeholder="Contoh: +6287730116407"
              value={editNoHp}
              onChange={(e) => setEditNoHp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>

          {/* 6. URL Foto Profil Manual */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-high">Atau Gunakan URL Foto</label>
            <input
              type="url"
              placeholder="https://..."
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-mono text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-text-high hover:bg-surface-sunken transition-all min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressingAvatar}
              className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all shadow-soft min-h-[44px] disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
