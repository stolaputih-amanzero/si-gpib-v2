'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';
import { useBiometricLogin } from '@/hooks/use-biometric-login';
import { useBiometricMotion } from './biometric-motion';

interface BiometricLoginProps {
  email?: string;
}

export function BiometricLogin({ email }: BiometricLoginProps) {
  const { status, error, loginWithBiometric, resetStatus } = useBiometricLogin();
  const { iconVariants, controls, shake } = useBiometricMotion();
  const prevStatus = useRef(status);

  useEffect(() => {
    if (status === 'error' && prevStatus.current !== 'error') {
      haptic.error();
      shake();
    } else if (status === 'success' && prevStatus.current !== 'success') {
      haptic.success();
    }
    prevStatus.current = status;
  }, [status, shake]);

  const handleLogin = () => {
    haptic.light();
    loginWithBiometric(email?.trim() || undefined);
  };

  return (
    <motion.div animate={controls} className="flex flex-col items-center gap-6 py-6 w-full">
      <motion.div
        variants={iconVariants}
        initial="idle"
        animate={status === 'loading' ? 'loading' : status === 'success' ? 'success' : 'idle'}
        className="relative w-20 h-20 flex items-center justify-center cursor-pointer"
        onClick={status === 'idle' ? handleLogin : undefined}
      >
        <div className={`absolute inset-0 rounded-full transition-colors ${
          status === 'success' ? 'bg-green-50' : status === 'error' ? 'bg-red-50' : 'bg-blue-50'
        }`} />
        {status === 'success' ? (
          <CheckCircle2 className="w-10 h-10 text-green-600 z-10" aria-hidden />
        ) : status === 'error' ? (
          <AlertCircle className="w-10 h-10 text-red-600 z-10" aria-hidden />
        ) : (
          <Fingerprint className="w-10 h-10 text-brand-primary z-10" aria-hidden />
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {status === 'error' && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-600 text-center bg-red-50 px-3 py-2 rounded-lg border border-red-100"
            role="alert"
          >
            <p>{error}</p>
            <button 
              type="button"
              onClick={resetStatus} 
              className="font-semibold underline mt-1"
            >
              Coba lagi
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleLogin}
        disabled={status === 'loading' || status === 'success'}
        className={`
          w-full min-h-[44px] rounded-xl font-bold text-sm flex items-center justify-center gap-2
          transition-all duration-300 active:scale-[0.98]
          ${(status === 'loading' || status === 'success')
            ? 'bg-surface-sunken text-text-muted cursor-not-allowed opacity-70' 
            : 'bg-surface-elevated border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5 shadow-sm'
          }
        `}
      >
        {status === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Memverifikasi...</>
        ) : status === 'success' ? (
          <><CheckCircle2 className="w-4 h-4" />Berhasil</>
        ) : (
          <><Fingerprint className="w-4 h-4" />Login dengan Biometrik</>
        )}
      </button>

      {!email && status === 'idle' && (
        <p className="text-[11px] text-text-muted text-center leading-relaxed">
          Gunakan biometrik (Fingerprint/Face ID) jika passkey sudah terdaftar.
        </p>
      )}
    </motion.div>
  );
}
