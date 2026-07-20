'use client';

import { Activity, Clock } from 'lucide-react';
import { BreadcrumbNav } from '@/components/hierarki/BreadcrumbNav';

export default function AktivitasPage() {
  return (
    <div className="space-y-6 pb-12">
      <BreadcrumbNav items={[{ label: 'Aktivitas Sistem', isCurrent: true }]} />

      <div className="bg-surface-elevated p-6 rounded-2xl border border-border-subtle shadow-soft space-y-4">
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-high">Log Aktivitas Sistem</h1>
            <p className="text-xs text-text-muted">Riwayat aktivitas & pembaruan data SI GPIB v2.2</p>
          </div>
        </div>

        <div className="p-8 text-center bg-surface-sunken/40 rounded-xl border border-border-subtle space-y-2">
          <Clock className="w-8 h-8 mx-auto text-brand-primary opacity-60" />
          <p className="text-sm font-semibold text-text-high">Aktivitas Terbaru</p>
          <p className="text-xs text-text-muted">Semua perubahan data master dan mutasi tercatat secara real-time di Supabase Audit Log.</p>
        </div>
      </div>
    </div>
  );
}
