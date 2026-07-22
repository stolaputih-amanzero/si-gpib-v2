'use client';

import { Fingerprint, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useBiometricLogin } from '@/hooks/use-biometric-login';

interface BiometricLoginProps {
  email?: string;
}

export function BiometricLogin({ email }: BiometricLoginProps) {
  const { status, error, loginWithBiometric, resetStatus } = useBiometricLogin();

  const handleLogin = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(10); // Light haptic
    
    if (email && email.trim().includes('@')) {
      loginWithBiometric(email.trim());
    } else {
      loginWithBiometric();
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-micro mt-6">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-sm font-medium text-green-800">Login berhasil! Mengalihkan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-6">
      {/* Tombol Login Biometric */}
      <button
        type="button"
        onClick={handleLogin}
        disabled={status === 'loading'}
        className={`
          w-full min-h-[44px] rounded-md font-medium text-base flex items-center justify-center gap-3
          transition-all duration-micro active:scale-[0.98]
          ${status === 'loading' 
            ? 'bg-surface-sunken text-text-muted cursor-not-allowed' 
            : 'bg-surface-elevated border border-border-strong text-text-high hover:bg-surface-sunken shadow-soft'
          }
        `}
        aria-label="Login dengan Biometrik"
      >
        {status === 'loading' ? (
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
        ) : (
          <Fingerprint className="w-5 h-5 text-brand-primary" />
        )}
        {status === 'loading' ? 'Memverifikasi...' : 'Login dengan Biometrik'}
      </button>

      {/* Error Message */}
      {status === 'error' && error && (
        <div className="bg-error/5 border border-error/20 rounded-md p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-micro">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-error">{error}</p>
            <button 
              type="button"
              onClick={resetStatus} 
              className="text-xs text-error underline mt-1 font-medium"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* Hint jika email belum diisi */}
      {!email && (
        <p className="text-xs text-text-muted text-center leading-relaxed">
          Tips: Anda dapat langsung login menggunakan biometrik perangkat ini jika passkey sudah terdaftar.
        </p>
      )}
    </div>
  );
}
