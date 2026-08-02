'use client';

import Link from 'next/link';
import { MapPinOff, ArrowLeft, RefreshCw } from 'lucide-react';

export interface PosNotFoundProps {
  id_pos: string;
}

export function PosNotFound({ id_pos }: PosNotFoundProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20 shadow-xs animate-bounce-short">
        <MapPinOff className="w-8 h-8" />
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 mb-2 border border-rose-200 dark:border-rose-900/50">
        404 — Data Tidak Ditemukan
      </span>

      <h1 className="text-xl font-extrabold text-text-high tracking-tight mb-2">
        Pos Pelkes Tidak Ditemukan
      </h1>

      <p className="text-sm text-text-muted mb-6 leading-relaxed">
        Pos Pelkes dengan ID <code className="px-1.5 py-0.5 rounded bg-surface-sunken font-mono text-xs text-brand-primary">{id_pos}</code> tidak ditemukan di sistem atau mungkin telah mengalami elevasi status / dihapus.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/dashboard/pos-pelkes"
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-xs hover:bg-brand-primary/90 active:scale-[0.98] transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ke Daftar Pos Pelkes</span>
        </Link>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-border-subtle bg-surface-1 text-text-high font-semibold text-sm hover:bg-surface-sunken active:scale-[0.98] transition-all min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4 text-text-tertiary" />
          <span>Coba Refresh</span>
        </button>
      </div>
    </div>
  );
}

export default PosNotFound;
