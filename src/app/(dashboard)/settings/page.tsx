'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import { Shield, Bell, Fingerprint, LogOut, ChevronRight, Check, User as UserIcon, RefreshCw, Crown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function SettingsHubPage() {
  const { user, nama, email, role, avatarUrl, isLoading, logout } = useUser();
  const { toast, confirm } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  const handleToggleBiometrics = () => {
    const nextState = !biometricsEnabled;
    setBiometricsEnabled(nextState);
    if (nextState) {
      toast.success('Biometrik Ditingkatkan', 'Fitur Passkey / FaceID siap digunakan untuk login berikutnya.');
    } else {
      toast.info('Biometrik Dinonaktifkan', 'Anda dapat mengaktifkannya kembali kapan saja.');
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-brand-primary/20">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={nama} className="w-full h-full object-cover" />
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
        </CardHeader>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Superadmin User & Role Management Hub */}
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

        {/* Biometric & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">Keamanan Biometrik (Passkey)</CardTitle>
                  <CardDescription className="line-clamp-1">
                    Masuk cepat ke SI GPIB menggunakan FaceID / TouchID
                  </CardDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleBiometrics}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  biometricsEnabled ? 'bg-brand-primary' : 'bg-surface-sunken border-border-strong'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    biometricsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
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
                    Pemberitahuan bantuan, permohonan pos, & pengingat ibadah
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
              onClick={() => toast.info('Ubah Kata Sandi', 'Fitur ubah sandi dikirim via email konfirmasi.')}
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
                <span className="text-sm">Keluar Sesi (Logout)</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
