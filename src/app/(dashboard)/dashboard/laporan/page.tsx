'use client';

import { FileText, BarChart3 } from 'lucide-react';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';

export default function LaporanPage() {
  return (
    <div className="space-y-6 pb-12">
      <BreadcrumbNav items={[{ label: 'Laporan', isCurrent: true }]} />

      <div className="bg-surface-elevated p-6 rounded-2xl border border-border-subtle shadow-soft space-y-4">
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-high">Laporan Eksekutif GPIB</h1>
            <p className="text-xs text-text-muted">Ringkasan Statistik Mupel, Jemaat Induk & Pos Pelkes</p>
          </div>
        </div>

        <div className="p-8 text-center bg-surface-sunken/40 rounded-xl border border-border-subtle space-y-2">
          <BarChart3 className="w-8 h-8 mx-auto text-emerald-600 opacity-60" />
          <p className="text-sm font-semibold text-text-high">Pusat Laporan & Rekapitulasi</p>
          <p className="text-xs text-text-muted">Fitur ekspor laporan Excel & PDF dalam tahap penyiapan modul analitik terpadu.</p>
        </div>
      </div>
    </div>
  );
}
