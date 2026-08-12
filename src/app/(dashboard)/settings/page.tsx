'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import { Bell, LogOut, ChevronRight, User as UserIcon, RefreshCw, Crown, Lock, X, Palette, KeyRound } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BiometricSetup } from '@/components/biometric/BiometricSetup';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';
import { useProfileAkun, useProfilePelayanan } from '@/hooks/use-profile';
import { getHumanReadableRoleLabel } from '@/lib/utils/role-presentation';

export default function SettingsHubPage() {
  const { user, nama, email, role, avatarUrl, isLoading, logout } = useUser();
  const { data: currentUser } = useCurrentUser();
  const isSuperUser = isSuperUserRole(currentUser?.role || role);
  const { toast, confirm } = useToast();
  
  const { data: akun } = useProfileAkun(user?.id);
  const { data: pelayanan } = useProfilePelayanan(akun?.id_pendeta);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [savedAvatar] = useState<string>('');

  const displayAvatar = savedAvatar || akun?.avatar_url || akun?.foto_url || pelayanan?.foto_url || avatarUrl;

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

  const humanRoleLabel = getHumanReadableRoleLabel(currentUser?.role || role);

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-high tracking-tight">
          Akun & Pengaturan
        </h1>
        <p className="text-xs md:text-sm text-text-muted mt-1">
          Kelola identitas akun, keamanan, otorisasi, dan preferensi aplikasi SI GPIB.
        </p>
      </div>

      {/* SECTION 1: IDENTITAS & PROFIL PELAYANAN */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">
          Identitas & Profil Pelayanan
        </h2>

        {/* Identity Header Card */}
        <Card className="relative overflow-hidden border-border-subtle bg-surface-1">
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
                    <CardTitle className="truncate text-lg">{isLoading ? 'Memuat Profil...' : nama}</CardTitle>
                    {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-text-muted" />}
                  </div>
                  <CardDescription className="truncate mt-0.5 font-mono text-xs text-text-muted">
                    {email}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      {humanRoleLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Smart Entry Link to F2 Canonical Person Workspace */}
        <Card className="border-border-subtle bg-surface-1 hover:bg-surface-sunken/50 transition-colors">
          <CardHeader className="p-4 sm:p-6">
            <Link
              href="/settings/profile"
              className="flex items-center justify-between w-full group min-h-[44px]"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2.5 rounded-control bg-brand-primary/10 text-brand-primary shrink-0 group-hover:scale-105 transition-transform border border-brand-primary/20">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <CardTitle className="text-base truncate group-hover:text-brand-primary transition-colors font-bold">
                    Profil Pelayanan Saya
                  </CardTitle>
                  <CardDescription className="line-clamp-1 mt-0.5">
                    Buka ruang kerja Profil 360° personal (identitas, keluarga, jabatan, &amp; log pastoral)
                  </CardDescription>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </CardHeader>
        </Card>
      </section>

      {/* SECTION 2: KEAMANAN & SESI */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">
          Keamanan & Akun
        </h2>

        {/* Biometric Setup & Security */}
        <BiometricSetup initialEnabled={biometricsEnabled} />

        {/* Password & Session Controls */}
        <Card className="border-border-subtle bg-surface-1 overflow-hidden">
          <CardContent className="p-0 divide-y divide-border-subtle">
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center justify-between w-full p-4 hover:bg-surface-sunken transition-colors text-left min-h-[52px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-sunken text-text-high">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-high block">Ubah Kata Sandi</span>
                  <span className="text-xs text-text-muted block">Perbarui sandi akun untuk akses aplikasi</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center justify-between w-full p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left text-red-600 dark:text-red-400 font-semibold min-h-[52px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm block">Keluar Sesi</span>
                  <span className="text-xs text-red-500/80 dark:text-red-400/80 font-normal block">Akhiri sesi aktif pada perangkat ini</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 3: ADMINISTRASI SISTEM (GATED SUPERADMIN) */}
      {isSuperUser && (
        <section className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">
            Administrasi Sistem
          </h2>

          <Card className="border-border-subtle bg-surface-1 hover:bg-surface-sunken/50 transition-colors">
            <CardHeader className="p-4 sm:p-6">
              <Link
                href="/settings/users"
                className="flex items-center justify-between w-full group min-h-[44px]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="p-2.5 rounded-control bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform border border-amber-500/20">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base truncate group-hover:text-amber-600 transition-colors font-bold">
                        Manajemen User & Role
                      </CardTitle>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Admin
                      </span>
                    </div>
                    <CardDescription className="line-clamp-1 mt-0.5">
                      Kelola daftar pengguna, penetapan peran, dan otorisasi hak akses sistem
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            </CardHeader>
          </Card>
        </section>
      )}

      {/* SECTION 4: PREFERENSI SISTEM */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">
          Preferensi Sistem
        </h2>

        {/* Theme & Appearance Settings */}
        <Card className="border-border-subtle bg-surface-1">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2.5 rounded-control bg-surface-brand text-brand-primary shrink-0 border border-brand-primary/20">
                  <Palette className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate font-bold">Tema Tampilan</CardTitle>
                  <CardDescription className="line-clamp-1">
                    Pilih tema terang, gelap, atau sesuaikan dengan preferensi perangkat
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
        <Card className="border-border-subtle bg-surface-1">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2.5 rounded-control bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-500/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate font-bold">Notifikasi Sistem</CardTitle>
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
      </section>

      {/* Modal Ubah Kata Sandi */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-md rounded-t-sheet sm:rounded-card p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-bold text-brand-primary flex items-center gap-2">
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
                  className="w-full px-3.5 py-2.5 rounded-control border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
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
                  className="w-full px-3.5 py-2.5 rounded-control border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
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
                  className="flex-1 py-2.5 rounded-control border border-border-subtle text-xs font-bold text-text-high hover:bg-surface-sunken transition-all min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="flex-1 py-2.5 rounded-control bg-brand-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-soft min-h-[44px] disabled:opacity-50"
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
