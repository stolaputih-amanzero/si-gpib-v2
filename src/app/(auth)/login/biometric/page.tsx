'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BiometricLoginPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleBiometricLogin = async () => {
    setStatus('loading');
    try {
      // 1. Dapatkan opsi authentication dari server
      const optionsRes = await fetch('/api/auth/webauthn/login/options');
      const options = await optionsRes.json();

      // 2. Jalankan autentikasi biometrik
      const authResponse = await startAuthentication(options);

      // 3. Verifikasi response ke server
      const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResponse),
      });

      if (!verifyRes.ok) {
        throw new Error('Verifikasi biometrik gagal');
      }

      setStatus('success');
      
      // Haptic feedback (opsional jika kita sudah tambahkan utility-nya)
      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Terjadi kesalahan saat login biometrik');
      
      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 bg-surface-base">
      <div className="max-w-md w-full mx-auto space-y-8 bg-surface-elevated p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-brand-primary">Login Biometrik</h2>
        <p className="text-text-muted mt-2">Masuk cepat dengan Face ID atau Fingerprint</p>

        <div className="py-8">
          <button 
            onClick={handleBiometricLogin}
            disabled={status === 'loading' || status === 'success'}
            className="w-24 h-24 mx-auto bg-blue-50 text-brand-primary rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11h.01"/><path d="M12 15h.01"/><path d="M12 19h.01"/><path d="M16 11h.01"/><path d="M16 15h.01"/><path d="M8 11h.01"/><path d="M8 15h.01"/><path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9z"/></svg>
          </button>

          {status === 'loading' && <p className="mt-6 text-brand-primary animate-pulse font-medium">Memverifikasi identitas...</p>}
          {status === 'success' && <p className="mt-6 text-green-600 font-medium">Berhasil masuk!</p>}
          {status === 'error' && <p className="mt-6 text-error text-sm">{errorMessage}</p>}
        </div>

        <div className="mt-4 border-t pt-6">
          <Link href="/login" className="text-text-muted hover:text-brand-primary text-sm font-medium block p-2">
            Gunakan Password
          </Link>
        </div>
      </div>
    </div>
  );
}
