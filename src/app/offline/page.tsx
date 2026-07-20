'use client';

import { WifiOff, Map, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 30]);
      }
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-base text-text-high">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center mb-6 shadow-soft border border-amber-200 dark:border-amber-900/40">
        <WifiOff className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse" />
      </div>

      <h1 className="text-2xl font-serif font-bold mb-2 text-center text-brand-primary">
        Anda Sedang Offline
      </h1>

      <p className="text-text-muted text-center mb-8 max-w-sm text-sm leading-relaxed">
        Koneksi internet terputus. Data yang sudah dibuka tetap dapat diakses, dan formulir yang sedang diisi tersimpan aman di HP sebagai <span className="font-semibold text-brand-primary">Draf Offline</span>.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          type="button"
          onClick={handleReload}
          className="w-full min-h-[48px] px-4 rounded-xl font-semibold text-sm text-white bg-brand-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-brand-primary flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Cek Koneksi Ulang</span>
        </button>

        <Link
          href="/dashboard"
          className="w-full min-h-[48px] px-4 rounded-xl font-semibold text-sm text-brand-primary bg-surface-elevated hover:bg-surface-sunken border border-border-subtle flex items-center justify-center gap-2 shadow-soft transition-all active:scale-[0.98]"
        >
          <Map className="w-5 h-5" />
          <span>Kembali ke Beranda Dashboard</span>
        </Link>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-surface-elevated border border-border-subtle max-w-sm space-y-2 text-xs text-text-muted">
        <p className="font-semibold text-text-high flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span>Jaminan Keamanan Data Lapangan:</span>
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Formulir otomatis menyimpan draf ke penyimpanan HP secara berkala.</li>
          <li>Data tertunda akan dikirim otomatis saat sinyal internet kembali.</li>
        </ul>
      </div>
    </div>
  );
}
