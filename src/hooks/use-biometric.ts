import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

type BiometricStatus = 'idle' | 'loading' | 'success' | 'error';

export function useBiometric() {
  const [status, setStatus] = useState<BiometricStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const registerBiometric = async () => {
    setStatus('loading');
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        throw new Error('Perangkat atau peramban ini belum mendukung sensor biometrik / Passkey.');
      }

      // 1. Get options from server
      const optionsRes = await fetch('/api/auth/webauthn/register/options');
      if (!optionsRes.ok) {
        const errJson = await optionsRes.json().catch(() => null);
        throw new Error(errJson?.error || 'Gagal mengambil opsi registrasi biometrik');
      }
      const options = await optionsRes.json();

      // 2. Start biometric registration (Fingerprint/Face ID)
      const attestationResponse = await startRegistration({ optionsJSON: options });

      // 3. Verify with server
      const verifyRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attestationResponse),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => null);
        throw new Error(errData?.error || 'Verifikasi biometrik gagal');
      }

      setStatus('success');
    } catch (err: any) {
      let msg = err.message || 'Terjadi kesalahan saat pendaftaran biometrik';
      if (err.name === 'NotAllowedError') {
        msg = 'Pendaftaran biometrik dibatalkan oleh pengguna atau tidak diizinkan oleh peramban.';
      } else if (err.name === 'InvalidStateError') {
        msg = 'Perangkat biometrik ini sudah pernah terdaftar untuk akun Anda.';
      }
      setError(msg);
      setStatus('error');
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
  };

  return { status, error, registerBiometric, resetStatus };
}
