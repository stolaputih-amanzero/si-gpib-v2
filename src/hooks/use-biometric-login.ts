import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

export function useBiometricLogin() {
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const loginWithBiometric = async (email: string) => {
    setStatus('loading');
    setError(null);

    try {
      // 1. Minta options dari server
      const optionsRes = await fetch('/api/auth/webauthn/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!optionsRes.ok) {
        const errData = await optionsRes.json();
        throw new Error(errData.error || 'Gagal memulai login biometric');
      }

      const { options, userId } = await optionsRes.json();

      // 2. Mulai proses biometric di device (Fingerprint/Face ID)
      const assertionResponse = await startAuthentication({ optionsJSON: options });

      // 3. Kirim respons ke server untuk verifikasi
      const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          credentialId: assertionResponse.id,
          response: assertionResponse,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json();
        throw new Error(errData.error || 'Verifikasi gagal');
      }

      setStatus('success');
      // Di sini Anda bisa trigger redirect ke dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
  };

  return { status, error, loginWithBiometric, resetStatus };
}
