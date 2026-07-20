'use client';

import { useState, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { BiometricSetup } from '@/components/biometric/BiometricSetup';
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/(auth)/login/actions';

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // Redirect is handled by the server action
  };

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-serif font-bold text-text-high">Profil Anda</h1>
          <p className="text-sm text-text-muted mt-1">Pengaturan akun dan keamanan</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Account Info */}
        <div className="bg-surface-elevated rounded-md p-6 shadow-sm border border-border-subtle">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-medium text-text-high text-lg">Informasi Akun</h3>
              <p className="text-sm text-text-muted">Detail pengguna terdaftar</p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Email</p>
                <p className="text-base text-text-high mt-1">{user?.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">ID Pengguna</p>
                <p className="text-base text-text-high mt-1">{user?.id || '-'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Biometric Setup */}
        <BiometricSetup />

        {/* Logout */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full min-h-[44px] bg-red-50 text-red-600 border border-red-200 rounded-md font-medium text-base flex items-center justify-center gap-2 hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            {isLoggingOut ? 'Sedang Keluar...' : 'Keluar dari Akun'}
          </button>
        </div>
      </div>
    </div>
  );
}
