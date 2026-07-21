'use client';

import { useState } from 'react';
import { Shield, Bell, Fingerprint, LogOut, ChevronRight, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function SettingsHubPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
          Pengaturan & Profil Pengguna
        </h1>
        <p className="text-xs md:text-sm text-text-muted mt-1">
          Kelola profil akun, keamanan biometrik, notifikasi, dan sesi aplikasi SI GPIB.
        </p>
      </div>

      {/* Profil User Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl">
              GPIB
            </div>
            <div>
              <CardTitle>Pengguna Pelayan SI GPIB</CardTitle>
              <CardDescription className="mt-0.5">
                Role: Pengurus Pos Pelkes / Presbiter
              </CardDescription>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 mt-2">
                <Check className="w-3 h-3" /> Akun Terverifikasi
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Biometric & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Keamanan Biometrik (Passkey)</CardTitle>
                  <CardDescription>
                    Masuk ke SI GPIB menggunakan FaceID / TouchID
                  </CardDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBiometricsEnabled(!biometricsEnabled)}
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
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Notifikasi Sistem</CardTitle>
                  <CardDescription>
                    Pemberitahuan bantuan, permohonan pos, & pengingat ibadah
                  </CardDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
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
              className="flex items-center justify-between w-full p-4 hover:bg-surface-sunken transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-text-muted" />
                <span className="text-sm font-semibold text-text-high">Ubah Kata Sandi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin keluar dari sesi aplikasi?')) {
                  window.location.href = '/login';
                }
              }}
              className="flex items-center justify-between w-full p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left text-red-600 dark:text-red-400 font-semibold"
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
    </div>
  );
}
