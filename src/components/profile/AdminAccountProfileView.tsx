'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Fingerprint, 
  KeyRound, 
  ChevronLeft, 
  ExternalLink, 
  Users, 
  Activity, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Church, 
  ArrowRight,
  X,
  LockKeyhole
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';
import { useProfileAkun, useHierarkiInfo } from '@/hooks/use-profile';
import { getHumanReadableRoleLabel } from '@/lib/utils/role-presentation';
import { StatusPill } from '@/components/ui/StatusPill';
import { BiometricSetup } from '@/components/biometric/BiometricSetup';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';

export function AdminAccountProfileView() {
  const { user, nama, email, role, avatarUrl, isLoading } = useUser();
  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();
  
  const { data: akun } = useProfileAkun(user?.id);
  const { data: hierarki } = useHierarkiInfo(akun?.id_mupel, akun?.id_induk, akun?.id_pos);
  
  const isSuperUser = isSuperUserRole(currentUser?.role || role, email || undefined);
  const humanRoleLabel = getHumanReadableRoleLabel(currentUser?.role || role);

  const [copiedId, setCopiedId] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const displayAvatar = akun?.avatar_url || akun?.foto_url || avatarUrl;

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

  const handleCopyId = () => {
    const idToCopy = user?.id || akun?.id || '';
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    toast.success('ID Akun Disalin', 'ID Pengguna berhasil disalin ke clipboard.');
    setTimeout(() => setCopiedId(false), 2000);
  };

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

  // Determine Scope Territory Description
  const getScopeDescription = () => {
    if (isSuperUser) {
      return {
        title: 'Seluruh Wilayah Sinode GPIB',
        subtitle: 'Otoritas tertinggi nasional mencakup seluruh Mupel, Jemaat Induk, dan Pos Pelkes di Indonesia.',
        badge: 'Sinode Nasional',
      };
    }
    if (hierarki?.jemaatNama) {
      return {
        title: `Jemaat ${hierarki.jemaatNama}`,
        subtitle: hierarki.mupelNama ? `Mupel ${hierarki.mupelNama}` : 'Otoritas tingkat jemaat lokal GPIB.',
        badge: 'Lokal Jemaat',
      };
    }
    if (hierarki?.mupelNama) {
      return {
        title: `Mupel ${hierarki.mupelNama}`,
        subtitle: 'Otoritas koordinasi wilayah Musyawarah Pelayanan (Mupel).',
        badge: 'Wilayah Mupel',
      };
    }
    return {
      title: 'Lingkup Terbatas',
      subtitle: 'Hak akses administratif terdistribusi sistem.',
      badge: 'Admin Unit',
    };
  };

  const scopeInfo = getScopeDescription();
  const linkedPersonId = currentUser?.id_person || akun?.id_person || currentUser?.id_pendeta || akun?.id_pendeta;

  return (
    <div className="w-full min-h-screen bg-surface-base pb-32 pt-2 sm:pt-4">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top Breadcrumb / Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-amber-700 dark:hover:text-amber-400 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800/60"
          >
            <ChevronLeft className="size-4" />
            <span>Kembali ke Pengaturan</span>
          </Link>

          <div className="flex items-center gap-2">
            <StatusPill variant="gold" dot={true}>
              {scopeInfo.badge}
            </StatusPill>
            <StatusPill variant="blue" dot={false}>
              {humanRoleLabel}
            </StatusPill>
          </div>
        </div>

        {/* Hero Identity Section (Fluid & Clean, No Heavy Nested Box) */}
        <section className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative size-20 sm:size-24 rounded-3xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-2xl sm:text-3xl overflow-hidden shrink-0 border border-amber-500/20 shadow-xs">
              {displayAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayAvatar} alt={nama} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="size-10 sm:size-12 text-amber-600 dark:text-amber-400" />
              )}
              <div className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-500 ring-2 ring-surface-base" title="Online / Aktif" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
                  {isLoading ? 'Memuat Profil...' : nama || email}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
                <span className="flex items-center gap-1.5 font-mono text-ink-tertiary">
                  <Mail className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  {email}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  Akun Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Hybrid Link Banner (If Admin is also linked to pastoral directory) */}
          {linkedPersonId && (
            <div className="pt-2">
              <Link
                href={`/people/${linkedPersonId}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Church className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs text-ink-primary font-medium truncate">
                    Akun ini terhubung ke direktori pelayanan. Buka <strong className="text-amber-700 dark:text-amber-400 font-bold">Workspace Pelayanan Pastoral</strong>
                  </span>
                </div>
                <ArrowRight className="size-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          )}
        </section>

        <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

        {/* Section 1: Kredensial & Detail Akun (Fluid Key-Value) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              Kredensial &amp; Data Akun
            </h2>
          </div>

          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60 text-sm">
            <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
              <span className="text-xs font-medium text-ink-secondary">ID Akun (User UUID)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-primary select-all">
                  {user?.id || akun?.id || '-'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="Salin ID"
                >
                  {copiedId ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
              <span className="text-xs font-medium text-ink-secondary">Role Otoritas Sistem</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {humanRoleLabel}
              </span>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
              <span className="text-xs font-medium text-ink-secondary">Nomor Kontak / WhatsApp</span>
              <span className="text-xs text-ink-primary font-mono">
                {akun?.no_hp || akun?.no_telepon || 'Belum ditautkan'}
              </span>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
              <span className="text-xs font-medium text-ink-secondary">Terdaftar Sejak</span>
              <span className="text-xs text-ink-primary flex items-center gap-1.5">
                <Calendar className="size-3.5 text-ink-tertiary" />
                {akun?.created_at ? new Date(akun.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sistem Utama'}
              </span>
            </div>
          </div>
        </section>

        <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

        {/* Section 2: Matriks Otoritas & Hak Akses (RBAC Matrix) */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
            Matriks Hak Akses &amp; Lingkup Otoritas (RBAC)
          </h2>

          {/* Scope Card Minimal */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <ShieldCheck className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{scopeInfo.title}</span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed pl-6">
              {scopeInfo.subtitle}
            </p>
          </div>

          {/* Granular Permission Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-800/50">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-primary block">Manajemen Pengguna &amp; Peran</span>
                <span className="text-[11px] text-ink-secondary">Kelola kredensial &amp; status aktif</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-800/50">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-primary block">Audit Trail &amp; Log Aktivitas</span>
                <span className="text-[11px] text-ink-secondary">Pemantauan mutasi data &amp; forensik</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-800/50">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-primary block">Kebijakan &amp; Kontrol Akses</span>
                <span className="text-[11px] text-ink-secondary">Konfigurasi hak akses &amp; batas wilayah</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/30 border border-stone-200/50 dark:border-stone-800/50">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink-primary block">Ekspor &amp; Rekapitulasi Data</span>
                <span className="text-[11px] text-ink-secondary">Laporan sensus, aset, &amp; keuangan</span>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

        {/* Section 3: Keamanan & Autentikasi (Fluid Row Items) */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
            Keamanan &amp; Autentikasi
          </h2>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800/70">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary shrink-0">
                  <Fingerprint className="size-4.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-ink-primary block leading-tight">
                    Keamanan Biometrik (Passkey / WebAuthn)
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    {biometricsEnabled ? 'Sensor sidik jari / Face ID aktif pada perangkat ini' : 'Belum diaktifkan pada perangkat ini'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBiometricModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer border border-amber-500/20 shrink-0 ml-2"
              >
                {biometricsEnabled ? 'Kelola' : 'Aktifkan'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-1 border border-stone-200/70 dark:border-stone-800/70">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-ink-secondary shrink-0">
                  <KeyRound className="size-4.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-ink-primary block leading-tight">
                    Kata Sandi Akun
                  </span>
                  <span className="text-[11px] text-ink-secondary block mt-0.5">
                    Ganti kata sandi login sistem secara berkala
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-ink-primary hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer shrink-0 ml-2 border border-stone-200/60 dark:border-stone-700"
              >
                Ubah Sandi
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Tautan Pintas Tata Kelola Sinodal (Fluid Actions) */}
        {isSuperUser && (
          <>
            <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
                Pusat Tata Kelola Cepat
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/settings/users"
                  className="p-3.5 rounded-2xl bg-surface-1 hover:bg-amber-500/5 border border-stone-200/70 dark:border-stone-800/70 hover:border-amber-500/30 transition-all group flex flex-col justify-between space-y-2"
                >
                  <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                      <span>Kelola Pengguna</span>
                      <ExternalLink className="size-3 text-ink-tertiary group-hover:text-amber-600" />
                    </span>
                    <span className="text-[11px] text-ink-secondary block mt-0.5">
                      Daftar akun &amp; role
                    </span>
                  </div>
                </Link>

                <Link
                  href="/developer/audit-trail"
                  className="p-3.5 rounded-2xl bg-surface-1 hover:bg-purple-500/5 border border-stone-200/70 dark:border-stone-800/70 hover:border-purple-500/30 transition-all group flex flex-col justify-between space-y-2"
                >
                  <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-primary group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center justify-between">
                      <span>Audit Trail</span>
                      <ExternalLink className="size-3 text-ink-tertiary group-hover:text-purple-600" />
                    </span>
                    <span className="text-[11px] text-ink-secondary block mt-0.5">
                      Jejak log aktivitas
                    </span>
                  </div>
                </Link>

                <Link
                  href="/settings/access-control"
                  className="p-3.5 rounded-2xl bg-surface-1 hover:bg-indigo-500/5 border border-stone-200/70 dark:border-stone-800/70 hover:border-indigo-500/30 transition-all group flex flex-col justify-between space-y-2"
                >
                  <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-ink-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                      <span>Kontrol Akses</span>
                      <ExternalLink className="size-3 text-ink-tertiary group-hover:text-indigo-600" />
                    </span>
                    <span className="text-[11px] text-ink-secondary block mt-0.5">
                      Aturan otorisasi
                    </span>
                  </div>
                </Link>
              </div>
            </section>
          </>
        )}

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
