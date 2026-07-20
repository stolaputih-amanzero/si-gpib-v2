'use client';

import { useState } from 'react';
import { Fingerprint, AlertCircle, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useBiometric } from '@/hooks/use-biometric';
import { haptic } from '@/lib/haptic/vibrate';

interface BiometricSetupProps {
  initialEnabled?: boolean;
}

export function BiometricSetup({ initialEnabled = false }: BiometricSetupProps) {
  const { status, error, registerBiometric, resetStatus } = useBiometric();
  const [isOverrideReset, setIsOverrideReset] = useState(false);

  // If initially enabled and user hasn't pressed reset, treat idle as active
  const isCurrentlyActive = (initialEnabled && status === 'idle' && !isOverrideReset) || status === 'success';

  const handleRegister = async () => {
    haptic.light();
    await registerBiometric();
    if (status === 'success') {
      haptic.success();
    }
  };

  const handleReset = () => {
    setIsOverrideReset(true);
    resetStatus();
  };

  return (
    <div className="bg-surface-elevated rounded-2xl p-5 shadow-sm border border-border-subtle transition-all">
      <div className="flex items-start gap-3.5 mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isCurrentlyActive 
            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
            : 'bg-brand-primary/10 text-brand-primary'
        }`}>
          <Fingerprint className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-text-high">
              Keamanan Biometrik
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isCurrentlyActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {isCurrentlyActive ? 'Aktif' : 'Belum Aktif'}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Scan Sidik Jari / Face ID untuk login instan di lapangan tanpa perlu mengetik password.
          </p>
        </div>
      </div>

      {/* State: Active / Previously Registered */}
      {isCurrentlyActive && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                Biometrik Aktif & Terdaftar
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Perangkat ini siap digunakan untuk login cepat
              </p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="px-2.5 py-1.5 bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1 shadow-2xs"
          >
            <RefreshCw className="w-3 h-3" />
            Atur ulang
          </button>
        </div>
      )}

      {/* State: Not Active / Reset Clicked */}
      {!isCurrentlyActive && status === 'idle' && (
        <button
          onClick={handleRegister}
          className="w-full min-h-[46px] bg-brand-primary text-white rounded-xl font-medium text-sm 
                     hover:bg-brand-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <Fingerprint className="w-5 h-5" />
          Aktifkan Biometrik di Perangkat Ini
        </button>
      )}

      {/* State: Loading */}
      {status === 'loading' && (
        <div className="w-full min-h-[46px] bg-surface-sunken rounded-xl flex items-center justify-center gap-3 text-brand-primary border border-brand-primary/20">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Sentuh sensor sidik jari HP Anda...</span>
        </div>
      )}

      {/* State: Error */}
      {status === 'error' && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3.5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-900 dark:text-red-200">Gagal mengaktifkan biometrik</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5 leading-tight">{error}</p>
            <button 
              onClick={handleReset} 
              className="text-xs text-red-700 dark:text-red-300 font-semibold underline mt-2 inline-block hover:text-red-900"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

