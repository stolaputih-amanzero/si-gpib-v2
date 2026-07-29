import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

export function useBiometricLogin() {
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const loginWithBiometric = async (email?: string) => {
    setStatus('loading');
    setError(null);

    try {
      // 1. Minta options dari server
      const hasEmail = email && email.trim().length > 0;
      const optionsRes = await fetch('/api/auth/webauthn/login/options', {
        method: hasEmail ? 'POST' : 'GET',
        headers: hasEmail ? { 'Content-Type': 'application/json' } : undefined,
        body: hasEmail ? JSON.stringify({ email: email.trim() }) : undefined,
      });

      if (!optionsRes.ok) {
        const errData = await optionsRes.json();
        throw new Error(errData.error || 'Gagal memulai login biometric');
      }

      const { options, userId } = await optionsRes.json();

      // 2. Mulai proses biometric di device (Fingerprint/Face ID) dengan auto-retry jika Credential Manager terdistraksi saat logout
      let assertionResponse;
      try {
        assertionResponse = await startAuthentication({ optionsJSON: options });
      } catch (authErr: any) {
        const errMsg = (authErr?.message || authErr?.name || '').toLowerCase();
        if (
          errMsg.includes('credential manager') ||
          errMsg.includes('notallowederror') ||
          errMsg.includes('unknown error') ||
          errMsg.includes('invalidstateerror')
        ) {
          // Tunggu 300ms agar Android Credential Manager siap pasca-logout lalu coba lagi
          await new Promise((resolve) => setTimeout(resolve, 300));
          assertionResponse = await startAuthentication({ optionsJSON: options });
        } else {
          throw authErr;
        }
      }

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
      
      const verifyData = await verifyRes.json();
      
      // Mengalihkan secara otomatis ke /dashboard (atau link callback jika ada)
      if (verifyData.redirectUrl) {
        window.location.href = verifyData.redirectUrl;
      } else {
        window.location.href = '/dashboard';
      }
      
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
