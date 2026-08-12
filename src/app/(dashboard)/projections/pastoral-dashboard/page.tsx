'use client';

import { ProjectionHeader } from '@/components/projections/ProjectionHeader';
import { BookOpen, Calendar, Users, Heart, Clock } from 'lucide-react';

const MOCK_PASTORAL_LOGS = [
  { id: 'LOG-01', tgl: '11 Feb 2026', jenis: 'Kunjungan Pastoral Keluarga', sasaran: 'Kel. Bp. Lukas (Pos Lahai Roi)', catatan: 'Pendampingan warta sukacita dan doa pergumulan usaha.' },
  { id: 'LOG-02', tgl: '09 Feb 2026', jenis: 'Konseling Kemitraan', sasaran: 'Sdr. Timothy & Sdri. Hannah', catatan: 'Bimbingan pranikah sesi 3 - Kesiapan pelayan jemaat.' },
  { id: 'LOG-03', tgl: '04 Feb 2026', jenis: 'Pastoral Orang Sakit', sasaran: 'Ibu Ruth (RSUD Sigi)', catatan: 'Doa penguatan dan perjamuan kudus orang sakit.' },
];

const MOCK_WORSHIP_SCHEDULE = [
  { id: 'IB-01', hari: 'Minggu, 15 Feb 2026', waktu: '09:00 WITA', nama: 'Ibadah Hari Minggu Jemaat', tempat: 'Gedung Gereja Utama Pos Lahai Roi' },
  { id: 'IB-02', hari: 'Rabu, 18 Feb 2026', waktu: '18:00 WITA', nama: 'Ibadah Rumah Tangga (Sektor 2)', tempat: 'Rumah Kel. Pnt. Thomas' },
];

export default function PastoralDashboardProjectionPage() {
  return (
    <div className="min-h-screen bg-surface-base pb-24">
      {/* U-1 Lens Boundary Header */}
      <ProjectionHeader
        title="Dashboard & Agregasi Pastoral"
        subtitle="Analisis agregasi log pelayanan pastoral, konseling, dan jadwal ibadah pos"
        badgeLabel="Lensa Pastoral"
        icon={<BookOpen className="w-6 h-6 text-emerald-500" />}
      />

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Metric Overview (U-4 tabular-nums) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Log Pastoral Bln Ini</span>
              <Heart className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-text-high font-sans tabular-nums">18 Log</div>
            <p className="text-[11px] text-text-muted">Kunjungan, konseling &amp; pendampingan</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Jadwal Ibadah Terjadwal</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-text-high font-sans tabular-nums">6 Ibadah</div>
            <p className="text-[11px] text-text-muted">Ibadah Minggu &amp; Rumah Tangga Pos</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Keluarga Dilayani</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-text-high font-sans tabular-nums">42 KK</div>
            <p className="text-[11px] text-text-muted">Jangkauan pastoral dalam wilayah pos</p>
          </div>
        </div>

        {/* Recent Pastoral Logs */}
        <div className="p-6 rounded-2xl bg-surface-elevated border border-border-subtle space-y-4">
          <h2 className="text-sm font-bold text-text-high flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-500" />
            <span>Riwayat Log Pastoral Terbaru (t_log_pastoral)</span>
          </h2>

          <div className="space-y-3">
            {MOCK_PASTORAL_LOGS.map((log) => (
              <div key={log.id} className="p-4 rounded-xl bg-surface-sunken border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{log.jenis}</span>
                  <span className="text-xs text-text-muted font-mono tabular-nums">{log.tgl}</span>
                </div>
                <p className="text-xs font-semibold text-text-high">{log.sasaran}</p>
                <p className="text-xs text-text-muted">{log.catatan}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Worship Schedule */}
        <div className="p-6 rounded-2xl bg-surface-elevated border border-border-subtle space-y-4">
          <h2 className="text-sm font-bold text-text-high flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Jadwal Ibadah Pos (t_jadwal_ibadah)</span>
          </h2>

          <div className="space-y-3">
            {MOCK_WORSHIP_SCHEDULE.map((ib) => (
              <div key={ib.id} className="p-4 rounded-xl bg-surface-sunken border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-text-high">{ib.nama}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{ib.tempat}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">{ib.hari}</span>
                  <span className="text-xs text-text-muted flex items-center gap-1 sm:justify-end mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {ib.waktu}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
