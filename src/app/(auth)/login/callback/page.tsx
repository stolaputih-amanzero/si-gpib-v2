'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginCallback() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleAuth = async () => {
      try {
        // 1. Cek apakah ada token di URL Hash (fragment #access_token=...)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) throw error;

            if (data.session) {
              // Hard redirect ke /dashboard agar browser mengirimkan cookies baru ke Next.js Server
              window.location.href = '/dashboard';
              return;
            }
          }
        }

        // 2. Cek sesi eksis jika hash tidak ada
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.location.href = '/dashboard';
        } else {
          setErrorMsg('Sesi tidak ditemukan dari token biometrik');
          setTimeout(() => {
            router.push('/login');
          }, 2500);
        }
      } catch (err) {
        console.error('Error handling biometric callback:', err);
        setErrorMsg((err as Error).message);
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center space-y-4 text-center px-4">
        {errorMsg ? (
          <>
            <p className="text-red-500 font-medium text-sm">Gagal memverifikasi sesi: {errorMsg}</p>
            <p className="text-text-muted text-xs">Mengalihkan kembali ke halaman login...</p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-muted text-sm animate-pulse">Memverifikasi sesi biometrik aman...</p>
          </>
        )}
      </div>
    </div>
  );
}

