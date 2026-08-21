'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import { 
  Bell, 
  LogOut, 
  ChevronRight, 
  User as UserIcon, 
  RefreshCw, 
  Crown, 
  Lock, 
  X, 
  Palette, 
  KeyRound, 
  Fingerprint, 
  ShieldCheck,
  Church,
  LockKeyhole
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BiometricSetup } from '@/components/biometric/BiometricSetup';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';
import { useProfileAkun, useProfilePelayanan } from '@/hooks/use-profile';
import { getHumanReadableRoleLabel } from '@/lib/utils/role-presentation';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';

export default function SettingsHubPage() {
  const { user, nama, email, role, avatarUrl, isLoading, logout } = useUser();
  const { data: currentUser } = useCurrentUser();
  const isSuperUser = isSuperUserRole(currentUser?.role || role, email || undefined);
  const { toast, confirm } = useToast();
  
  const { data: akun } = useProfileAkun(user?.id);
  const { data: pelayanan } = useProfilePelayanan(akun?.id_pendeta);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [savedAvatar] = useState<string>('');

  const displayAvatar = savedAvatar || akun?.avatar_url || akun?.foto_url || pelayanan?.foto_url || avatarUrl;
  const linkedPersonId = currentUser?.id_person || akun?.id_person || currentUser?.id_pendeta || akun?.id_pendeta;

  useEffect(() => {
    if (!user) return;
    const fetchBiometricsStatus = async () => {
      try {
        const res = await fetch('/api/auth/webauthn/status');
        if (res.ok) {
          const body = await res.json();
          if (typeof body.enabled === 'boolean') {
            setBiometricsEnabled(body.enabled);
          }
        }
      } catch (err) {
        console.error('Error fetching biometric status:', err);
      }
    };
    fetchBiometricsStatus();
  }, [user]);

  // States for modals
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
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
      toast.error('Kombinasi Tidak Cocok', 'Konfirmasi password baru tidak sama.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast.success('Kata Sandi Diperbarui', 'Kata sandi akun Anda berhasil diganti.');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Gagal Mengubah Kata Sandi', error?.message || 'Terjadi kesalahan sistem.');
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
    <div className="w-full min-h-screen bg-surface-base pb-32 pt-2 sm:pt-4">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header Bar */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-3">
            <StatusPill variant="gold" dot={true}>
              {humanRoleLabel}
            </StatusPill>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-ink-primary tracking-tight leading-[1.15]">
              Pengaturan <span className="font-editorial-italic font-normal text-amber-700 dark:text-amber-400">Akun.</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Pusat kendali profil, keamanan, preferensi aplikasi, dan otorisasi sistem.
            </p>
          </div>
        </section>

        {/* Identity Hero Section (Fluid & Clean) */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-4 min-w-0">
            <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-amber-500/20 shadow-2xs">
              {displayAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayAvatar} alt={nama} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="size-8 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base sm:text-lg text-ink-primary truncate block">
                {isLoading ? 'Memuat Profil...' : nama || email}
              </span>
              <p className="font-mono text-xs text-ink-secondary truncate mt-0.5">
                {email}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {humanRoleLabel}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Aktif
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/settings/profile"
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-center shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Buka Profil</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </section>

        <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

        {/* GROUP 1: AKUN & KEAMANAN */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
            Akun &amp; Keamanan
          </h2>

          <div className="space-y-1.5">
            <Link
              href="/settings/profile"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary group-hover:text-amber-700 dark:group-hover:text-amber-400 shrink-0 transition-colors">
                  {isSuperUser ? (
                    <ShieldCheck className="size-4.5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <UserIcon className="size-4.5" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-semibold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors block leading-tight">
                    {isSuperUser ? 'Profil Akun & Hak Akses' : 'Profil Pelayanan Saya'}
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    {isSuperUser ? 'Detail kredensial, level hak akses, dan lingkup peran' : 'Ruang kerja biodata, penugasan & log pastoral'}
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            {isSuperUser && linkedPersonId && (
              <Link
                href={`/people/${linkedPersonId}`}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary group-hover:text-amber-700 dark:group-hover:text-amber-400 shrink-0 transition-colors">
                    <Church className="size-4.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors block leading-tight">
                      Profil Pelayanan Pastoral
                    </span>
                    <span className="text-[11px] text-ink-secondary block mt-0.5">
                      Ruang kerja biodata, penugasan &amp; log pastoral
                    </span>
                  </div>
                </div>
                <ChevronRight className="size-4.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsBiometricModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary group-hover:text-amber-700 dark:group-hover:text-amber-400 shrink-0 transition-colors">
                  <Fingerprint className="size-4.5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors block leading-tight">
                    Keamanan Biometrik
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    WebAuthn / Passkey / Face ID
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                  biometricsEnabled
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-stone-100 dark:bg-stone-800 text-ink-tertiary border-stone-200/80 dark:border-stone-700'
                )}>
                  {biometricsEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
                <ChevronRight className="size-4.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary group-hover:text-amber-700 dark:group-hover:text-amber-400 shrink-0 transition-colors">
                  <KeyRound className="size-4.5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors block leading-tight">
                    Ubah Kata Sandi
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    Perbarui kata sandi akun sistem
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        </section>

        <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

        {/* GROUP 2: PREFERENSI & APLIKASI */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
            Preferensi &amp; Aplikasi
          </h2>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-3 rounded-2xl">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary shrink-0">
                  <Palette className="size-4.5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-ink-primary block leading-tight">
                    Tema Tampilan
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    Mode terang atau gelap
                  </span>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary shrink-0">
                  <Bell className="size-4.5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-ink-primary block leading-tight">
                    Notifikasi Sistem
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    Pemberitahuan aktivitas &amp; pelayanan
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleNotifications}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  notificationsEnabled ? 'bg-amber-600 dark:bg-amber-500' : 'bg-stone-200 dark:bg-stone-800'
                )}
                aria-label="Toggle notifikasi sistem"
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <Link
              href="/offline-sync"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary group-hover:text-amber-700 dark:group-hover:text-amber-400 shrink-0 transition-colors">
                  <RefreshCw className="size-4.5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors block leading-tight">
                    Manajer Sinkronisasi (Offline Sync)
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    Status sinkronisasi data lokal &amp; server
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </div>
        </section>

        {/* GROUP 3: ADMINISTRASI SINODAL (Super User) */}
        {isSuperUser && (
          <>
            <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
                Administrasi Sinodal
              </h2>

              <div className="space-y-1.5">
                <Link
                  href="/settings/users"
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary group-hover:text-amber-700 dark:group-hover:text-amber-400 shrink-0 transition-colors">
                      <Crown className="size-4.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors block leading-tight">
                        Manajemen Pengguna &amp; Peran
                      </span>
                      <span className="text-[11px] text-ink-secondary block mt-0.5">
                        Kelola akun pengguna, aktivasi &amp; peran sistem
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4.5 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>

                <Link
                  href="/developer/audit-trail"
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary group-hover:text-purple-600 dark:group-hover:text-purple-400 shrink-0 transition-colors">
                      <ShieldCheck className="size-4.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-ink-primary group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors block leading-tight">
                        Audit Trail Aktivitas Sistem
                      </span>
                      <span className="text-[11px] text-ink-secondary block mt-0.5">
                        Jejak log mutasi, akses &amp; forensik sistem
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4.5 text-stone-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>

                <Link
                  href="/settings/access-control"
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 transition-colors">
                      <Lock className="size-4.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-ink-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block leading-tight">
                        Kebijakan &amp; Kontrol Akses
                      </span>
                      <span className="text-[11px] text-ink-secondary block mt-0.5">
                        Konfigurasi aturan otorisasi &amp; batasan teritori
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4.5 text-stone-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </div>
            </section>
          </>
        )}

        <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

        {/* GROUP 4: SESI PENGGUNA */}
        <section className="space-y-3">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors group cursor-pointer text-left"
            aria-label="Keluar Sesi"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <LogOut className="size-4.5" />
              </div>
              <div>
                <span className="text-sm font-bold block leading-tight">
                  Keluar Sesi
                </span>
                <span className="text-[11px] text-red-600/70 dark:text-red-400/70 block mt-0.5">
                  Akhiri sesi aktif akun ini dari perangkat
                </span>
              </div>
            </div>
            <ChevronRight className="size-4.5 text-red-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </section>

      </main>

      {/* Child Modal: Keamanan Biometrik */}
      {isBiometricModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Fingerprint className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink-primary">
                    Keamanan Biometrik
                  </h2>
                  <p className="text-xs text-ink-secondary">
                    WebAuthn / Passkey / Face ID
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBiometricModalOpen(false)}
                className="size-9 rounded-full bg-surface-sunken flex items-center justify-center text-ink-secondary hover:text-ink-primary min-h-[40px] min-w-[40px] cursor-pointer"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-2">
              <BiometricSetup initialEnabled={biometricsEnabled} />
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsBiometricModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-surface-sunken hover:bg-stone-200 dark:hover:bg-stone-800 text-xs font-bold text-ink-primary transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Child Modal: Ubah Kata Sandi */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <LockKeyhole size={18} />
                  <span>Ubah Kata Sandi</span>
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Masukkan kata sandi baru untuk akun Anda
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="size-9 rounded-full bg-surface-sunken flex items-center justify-center text-ink-secondary hover:text-ink-primary min-h-[40px] min-w-[40px] cursor-pointer"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Kata Sandi Baru *</label>
                <input
                  type="password"
                  placeholder="Min. 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-sunken text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500/40 min-h-[44px]"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Konfirmasi Kata Sandi Baru *</label>
                <input
                  type="password"
                  placeholder="Ketik ulang kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-sunken text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-amber-500/40 min-h-[44px]"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-ink-primary hover:bg-surface-sunken transition-all min-h-[44px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold active:scale-95 transition-all min-h-[44px] disabled:opacity-50 cursor-pointer shadow-xs"
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
