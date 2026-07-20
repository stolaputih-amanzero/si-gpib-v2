'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { WifiOff, RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NetworkBanner() {
  const { isOnline, pendingCount } = useNetworkStatus();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // If online and no pending queue, don't display banner
  if (isOnline && pendingCount === 0) return null;
  if (dismissed) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 min-h-[44px] px-4 py-2.5 flex items-center justify-between shadow-float backdrop-blur-md transition-all animate-in slide-in-from-top ${
        !isOnline
          ? 'bg-amber-500 text-white font-medium'
          : 'bg-emerald-600 text-white font-medium'
      }`}
    >
      <div className="flex items-center gap-2.5 text-xs sm:text-sm max-w-4xl mx-auto">
        {!isOnline ? (
          <>
            <WifiOff size={18} className="shrink-0 animate-pulse text-amber-100" />
            <p>
              <span className="font-bold">Mode Offline</span> — Data yang Anda isi tersimpan aman di HP & akan dikirim otomatis saat sinyal kembali.
            </p>
          </>
        ) : (
          <>
            <RefreshCw size={18} className="shrink-0 animate-spin text-emerald-100" />
            <p>
              <span className="font-bold">Koneksi Kembali</span> — Menyinkronkan {pendingCount} data yang tertunda ke server...
            </p>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1 rounded-full hover:bg-black/20 text-white transition-colors shrink-0 ml-2"
        aria-label="Tutup Banner"
      >
        <X size={16} />
      </button>
    </div>
  );
}
