'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import { Shield, Bell, LogOut, ChevronRight, Check, User as UserIcon, RefreshCw, Crown, Lock, X, Palette, Edit3, Camera, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BiometricSetup } from '@/components/biometric/BiometricSetup';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { updateOwnProfileAction } from './actions';
import { useQueryClient } from '@tanstack/react-query';
import { compressImage } from '@/lib/camera/compress';

import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';

import { useProfileAkun, useProfilePelayanan } from '@/hooks/use-profile';

export default function SettingsHubPage() {
  const { user, nama, email, role, avatarUrl, isLoading, logout } = useUser();
  const { data: currentUser } = useCurrentUser();
  const isSuperUser = isSuperUserRole(currentUser?.role || role);
  const { toast, confirm } = useToast();
  
  const queryClient = useQueryClient();
  const { data: akun } = useProfileAkun(user?.id);
  const { data: pelayanan } = useProfilePelayanan(akun?.id_pendeta);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  // States for Profile Editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNama, setEditNama] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNoHp, setEditNoHp] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savedAvatar, setSavedAvatar] = useState<string>('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  const displayAvatar = savedAvatar || avatarUrl;

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const rawFile = files[0];

    setIsCompressingAvatar(true);
    try {
      const compressed = await compressImage(rawFile);
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

  const handleOpenEditProfile = () => {
    const phoneValue =
      pelayanan?.no_telepon ||
      akun?.no_hp ||
      user?.no_telepon ||
      user?.no_hp ||
      user?.user_metadata?.no_telepon ||
      user?.user_metadata?.no_hp ||
      '';

    setEditNama(pelayanan?.nama_pendeta || akun?.nama_lengkap || nama || '');
    setEditEmail(email || '');
    setEditNoHp(phoneValue);
    setEditAvatar(displayAvatar || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNama.trim()) {
      toast.error('Nama Wajib Diisi', 'Silakan masukkan nama lengkap Anda.');
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const res = await updateOwnProfileAction({
        nama_lengkap: editNama.trim(),
        email: editEmail.trim(),
        no_hp: editNoHp.trim(),
        avatar_url: editAvatar.trim(),
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      const updatedAvatar = res.avatar_url || editAvatar.trim();
      setSavedAvatar(updatedAvatar);

      // Update localStorage cache directly with the new avatar URL so reload loads new avatar instantly
      try {
        const cachedUser = localStorage.getItem('si_gpib_cached_user');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          parsed.avatar_url = updatedAvatar;
          parsed.foto_url = updatedAvatar;
          parsed.user_metadata = {
            ...(parsed.user_metadata || {}),
            avatar_url: updatedAvatar,
            foto_url: updatedAvatar,
            picture: updatedAvatar,
            nama_lengkap: editNama.trim(),
          };
          localStorage.setItem('si_gpib_cached_user', JSON.stringify(parsed));
        }

        const cachedCurr = localStorage.getItem('si_gpib_cached_current_user');
        if (cachedCurr) {
          const parsedCurr = JSON.parse(cachedCurr);
          parsedCurr.nama_lengkap = editNama.trim();
          localStorage.setItem('si_gpib_cached_current_user', JSON.stringify(parsedCurr));
        }
      } catch {}

      toast.success('Profil Diperbarui', 'Data profil Anda berhasil disimpan.');
      setIsEditingProfile(false);
      
      queryClient.invalidateQueries({ queryKey: ['current-user-auth'] });
    } catch (err: any) {
      toast.error('Gagal Simpan Profil', err?.message || 'Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchBiometricsStatus = async () => {
      try {
        const res = await fetch('/api/auth/webauthn/status');
        if (res.ok) {
          const body = await res.json();
          if (typeof body.enabled === 'boolean') {
            setBiometricsEnabled(body.enabled);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching biometric status:', err);
      }
    };
    fetchBiometricsStatus();
  }, [user]);

  // States for password changing modal
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password Terlalu Pendek', 'Password minimal terdiri dari 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Kombinasi Tidak Cocok', 'Konfirmasi password baru tidak sama dengan password baru.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast.success('Kata Sandi Diperbarui', 'Kata sandi Anda berhasil diubah. Gunakan kata sandi ini untuk login berikutnya.');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Gagal Mengubah Kata Sandi', error?.message || 'Terjadi kesalahan saat memperbarui kata sandi.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };


  const handleToggleNotifications = () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    if (nextState) {
      toast.success('Notifikasi Aktif', 'Pemberitahuan penting akan dikirimkan ke perangkat Anda.');
    } else {
      toast.info('Notifikasi Hening', 'Notifikasi sistem telah dibisukan.');
    }
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
          Pengaturan & Profil Pengguna
        </h1>
        <p className="text-xs md:text-sm text-text-muted mt-1">
          Kelola profil akun, keamanan biometrik, otorisasi RBAC, dan sesi aplikasi SI GPIB.
        </p>
      </div>

      {/* Dynamic Profile Card */}
      <Card className="relative overflow-hidden group">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-brand-primary/20">
                {displayAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displayAvatar} alt={nama} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-brand-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="truncate">{isLoading ? 'Memuat Profil...' : nama}</CardTitle>
                  {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-text-muted" />}
                </div>
                <CardDescription className="truncate mt-0.5 font-mono text-xs">
                  {email}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 uppercase">
                    {role}
                  </span>
                  {user && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <Check className="w-3 h-3" /> Sesi Terverifikasi
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/settings/profile"
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-all text-xs font-bold shrink-0 min-h-[44px] shadow-sm active:scale-95"
              >
                <UserIcon size={16} />
                <span>Buka Profil 360°</span>
              </Link>

              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-xs font-bold shrink-0 min-h-[44px] border border-brand-primary/20 active:scale-95 shadow-2xs"
              >
                <Edit3 size={15} />
                <span>Edit Profil</span>
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Profile 360 Dedicated Hub Card */}
        <Card className="border-brand-500/30 bg-brand-500/5 dark:bg-brand-950/10">
          <CardHeader>
            <Link
              href="/settings/profile"
              className="flex items-center justify-between w-full group min-h-[44px]"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2.5 rounded-xl bg-brand-600 text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div>
                    <CardTitle className="text-base truncate group-hover:text-brand-600 transition-colors font-bold">
                      Profil 360° Saya
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-1 mt-0.5">
                    Kelola data pribadi, identitas pelayanan, keluarga, hierarki, dan aktivitas akun
                  </CardDescription>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-brand-600 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </CardHeader>
        </Card>
        {/* Superadmin User & Role Management Hub */}
        {isSuperUser && (
          <Card className="border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/10">
            <CardHeader>
              <Link
                href="/settings/users"
                className="flex items-center justify-between w-full group min-h-[44px]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base truncate group-hover:text-purple-600 transition-colors">
                        Manajemen User & Role (Superadmin)
                      </CardTitle>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500 text-white">
                        Superuser
                      </span>
                    </div>
                    <CardDescription className="line-clamp-1 mt-0.5">
                      Atur otorisasi akun pengguna, penetapan role, dan penguncian Poka-Yoke RBAC
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </CardHeader>
          </Card>
        )}

        {/* Biometric Setup & Security */}
        <BiometricSetup initialEnabled={biometricsEnabled} />

        {/* Theme & Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2.5 rounded-xl bg-surface-brand text-brand-600 shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">Tema Tampilan</CardTitle>
                  <CardDescription className="line-clamp-1">
                    Pilih tema terang, gelap, atau ikuti preferensi sistem perangkat Anda
                  </CardDescription>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <ThemeToggle />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">Notifikasi Sistem</CardTitle>
                  <CardDescription className="line-clamp-1">
                    Pemberitahuan bantuan, permohonan pos, &amp; pengingat ibadah
                  </CardDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notificationsEnabled ? 'bg-brand-primary' : 'bg-surface-sunken border-border-strong'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </CardHeader>
        </Card>

        {/* Account Options */}
        <Card>
          <CardContent className="p-0 divide-y divide-border-subtle">
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center justify-between w-full p-4 hover:bg-surface-sunken transition-colors text-left min-h-[52px]"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-text-muted" />
                <span className="text-sm font-semibold text-text-high">Ubah Kata Sandi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center justify-between w-full p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left text-red-600 dark:text-red-400 font-semibold min-h-[52px]"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Keluar Sesi</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Modal Edit Profil Pengguna */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <UserIcon size={18} />
                  <span>Edit Profil Pengguna</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Perbarui nama lengkap dan informasi profil akun Anda
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
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
                    <p className="text-[10px] text-text-muted truncate">Kamera HP atau foto galeri (max 5MB)</p>
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
                  value={role?.toUpperCase() || ''}
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-text-high hover:bg-surface-sunken transition-all min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all shadow-soft min-h-[44px] disabled:opacity-50"
                >
                  {isSubmittingProfile ? 'Memproses...' : 'Simpan Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Kata Sandi */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <Lock size={18} />
                  <span>Ubah Kata Sandi</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Masukkan kata sandi baru Anda untuk akun ini
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Password Baru */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Kata Sandi Baru *</label>
                <input
                  type="password"
                  placeholder="Min. 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
                  required
                  minLength={6}
                />
              </div>

              {/* Konfirmasi Password Baru */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Konfirmasi Kata Sandi Baru *</label>
                <input
                  type="password"
                  placeholder="Ketik ulang kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
                  required
                  minLength={6}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-text-high hover:bg-surface-sunken transition-all min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all shadow-soft min-h-[44px] disabled:opacity-50"
                >
                  {isSubmittingPassword ? 'Memproses...' : 'Simpan Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
