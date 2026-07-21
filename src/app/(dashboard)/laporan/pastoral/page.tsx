'use client';

import { FileText, Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function LaporanPastoralPage() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Log Pastoral & Kunjungan</h1>
          <p className="text-xs md:text-sm text-text-muted mt-0.5">Catatan Pelayanan Pastoral, Konseling & Kunjungan Rumah Jemaat Pos</p>
        </div>

        <Link
          href="/laporan/pastoral/baru"
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all flex items-center gap-2 shadow-soft min-h-[44px]"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">+ Catat Kunjungan</span>
          <span className="sm:hidden">+ Log</span>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Kunjungan</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">0</p>
          <p className="text-[11px] text-text-muted mt-0.5">Catatan Terdaftar</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Bulan Ini</p>
          <p className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">0</p>
          <p className="text-[11px] text-text-muted mt-0.5">Pelayanan Pastoral</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Pendeta & Pelayan</p>
          <p className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">0</p>
          <p className="text-[11px] text-text-muted mt-0.5">Aktif Menginput</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Cari log pastoral (nama jemaat, perihal, pelayan)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
          />
        </div>
      </div>

      {/* Empty State / List */}
      <div className="bg-surface-elevated rounded-2xl p-10 text-center border border-border-subtle space-y-3">
        <FileText size={40} className="mx-auto text-text-muted opacity-40" />
        <h3 className="font-serif font-bold text-text-high text-base">Belum Ada Log Pastoral</h3>
        <p className="text-xs text-text-muted max-w-md mx-auto">
          Catat kunjungan rumah tangga, konseling jemaat, dan pelayanan sakramen/doa di Pos Pelkes.
        </p>
        <Link
          href="/laporan/pastoral/baru"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-all shadow-soft min-h-[44px]"
        >
          <Plus size={16} />
          <span>Tambah Log Pastoral Pertama</span>
        </Link>
      </div>
    </div>
  );
}
