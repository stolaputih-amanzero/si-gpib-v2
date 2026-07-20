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
      // 1. Get options from server
      const optionsRes = await fetch('/api/auth/webauthn/register/options');
      if (!optionsRes.ok) throw new Error('Gagal mengambil opsi registrasi');
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
        const errData = await verifyRes.json();
        throw new Error(errData.error || 'Verifikasi gagal');
      }

      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      setStatus('error');
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
  };

  return { status, error, registerBiometric, resetStatus };
}
