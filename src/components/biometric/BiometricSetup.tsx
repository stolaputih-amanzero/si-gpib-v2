'use client';

import { Fingerprint, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useBiometric } from '@/hooks/use-biometric';
import { haptic } from '@/lib/haptic/vibrate';

export function BiometricSetup() {
  const { status, error, registerBiometric, resetStatus } = useBiometric();

  const handleRegister = async () => {
    haptic.light();
    await registerBiometric();
    if (status === 'success') {
      haptic.success();
    }
  };

  return (
    <div className="bg-surface-elevated rounded-md p-6 shadow-soft border border-border-subtle">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Fingerprint className="w-6 h-6 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text-high font-sans">
            Login dengan Biometrik
          </h3>
          <p className="text-sm text-text-muted mt-1 leading-relaxed">
            Gunakan sidik jari atau Face ID untuk login lebih cepat dan aman di lapangan.
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <button
          onClick={handleRegister}
          className="w-full min-h-[44px] bg-brand-primary text-white rounded-md font-medium text-base 
                     hover:bg-brand-primary/90 active:scale-[0.98] transition-all duration-micro"
        >
          <Fingerprint className="w-5 h-5 inline-block mr-2 -mt-1" />
          Aktifkan Biometrik
        </button>
      )}

      {status === 'loading' && (
        <div className="w-full min-h-[44px] bg-surface-sunken rounded-md flex items-center justify-center gap-3 text-brand-primary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-base font-medium">Sentuh sensor biometrik...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Biometrik berhasil diaktifkan!</p>
            <button 
              onClick={resetStatus} 
              className="text-xs text-green-600 underline mt-1"
            >
              Atur ulang
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-error/5 border border-error/20 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error">Gagal mengaktifkan biometrik</p>
            <p className="text-xs text-error/80 mt-1">{error}</p>
            <button 
              onClick={resetStatus} 
              className="text-xs text-error underline mt-2"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
