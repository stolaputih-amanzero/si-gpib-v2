'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, Copy, Check, Shield, Mail, Smartphone, Info } from 'lucide-react';
import { BiometricSetup } from '@/components/biometric/BiometricSetup';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/(auth)/login/actions';
import { haptic } from '@/lib/haptic/vibrate';

export default function ProfilPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);

      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role, biometric_enabled, no_telepon, status')
          .eq('id', user.id)
          .maybeSingle();

        setProfileData(data);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleCopyId = () => {
    if (authUser?.id) {
      navigator.clipboard.writeText(authUser.id);
      setCopiedId(true);
      haptic.light();
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleLogout = async () => {
    haptic.medium();
    setIsLoggingOut(true);
    await logout();
  };

  const roleLabels: Record<string, string> = {
    super_user: 'Super User (Admin Pusat)',
    admin_mupel: 'Admin Mupel',
    kmj: 'Ketua Majelis Jemaat (KMJ)',
    pj: 'Penanggung Jawab (PJ)',
    user: 'Pengguna / Pelayan',
  };

  const userRole = profileData?.role || 'user';
  const roleFormatted = roleLabels[userRole] || userRole.toUpperCase();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-base pb-28">
      {/* Mobile Sticky Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-serif font-bold text-text-high">Profil Pengguna</h1>
            <p className="text-xs text-text-muted">Pengaturan akun & sistem keamanan</p>
          </div>
          <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-semibold">
            SI GPIB v2.2
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
        {/* Card 1: Account Header & Info */}
        <div className="bg-surface-elevated rounded-2xl p-5 shadow-sm border border-border-subtle">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 pb-4 border-b border-border-subtle">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-blue-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md flex-shrink-0">
                  {authUser?.email ? authUser.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-text-high text-base truncate">
                    {authUser?.email ? authUser.email.split('@')[0] : 'Pengguna'}
                  </h2>
                  <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800 text-brand-primary dark:text-blue-300 rounded-lg text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    <span>{roleFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Detail Items */}
              <div className="pt-4 space-y-3.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-text-muted text-xs font-medium">
                    <Mail className="w-4 h-4 text-brand-primary" />
                    <span>Email Terdaftar</span>
                  </div>
                  <span className="text-text-high font-medium text-xs sm:text-sm truncate max-w-[200px]">
                    {authUser?.email || '-'}
                  </span>
                </div>

                {profileData?.no_telepon && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-text-muted text-xs font-medium">
                      <Smartphone className="w-4 h-4 text-brand-primary" />
                      <span>Nomor Telepon</span>
                    </div>
                    <span className="text-text-high font-medium text-xs sm:text-sm">
                      {profileData.no_telepon}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2 text-text-muted text-xs font-medium">
                    <Info className="w-4 h-4 text-brand-primary" />
                    <span>ID User</span>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-sunken hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-xs font-mono text-text-high transition-colors group"
                    title="Salin ID User"
                  >
                    <span className="max-w-[120px] truncate sm:max-w-[180px]">
                      {authUser?.id || '-'}
                    </span>
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-text-high" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Card 2: Biometric Setup */}
        <BiometricSetup initialEnabled={profileData?.biometric_enabled} />

        {/* Card 3: Prominent Logout Action */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full min-h-[50px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-[0.98] transition-all shadow-xs disabled:opacity-50"
          >
            <LogOut className="w-5 h-5 stroke-[2.2px]" />
            <span>{isLoggingOut ? 'Sedang Keluar...' : 'Keluar dari Akun'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

