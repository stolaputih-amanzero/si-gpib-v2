'use client';

import React, { useState } from 'react';
import { PastoralViewModel } from '../../../types/personViewModel.types';
import { PrivacyStateNotice } from '../PrivacyStateNotice';
import { HeartHandshake, Calendar, FileText, Lock, Clock, Sparkles, Image as ImageIcon, MapPin, Camera, X } from 'lucide-react';

interface PastoralSectionProps {
  pastoral: PastoralViewModel;
}

export const PastoralSection: React.FC<PastoralSectionProps> = ({ pastoral }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="pastoral" className="scroll-mt-36 md:scroll-mt-28 space-y-3 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-text-high flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-brand-primary" />
          Pelayanan &amp; Aktivitas Pastoral
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
        {/* Card 1: Upcoming Schedules */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-4 w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Jadwal Pelayanan Mendatang</span>
            </h3>
          </div>

          {pastoral.upcomingSchedules.type === 'DATA' ? (
            <div className="space-y-3">
              {pastoral.upcomingSchedules.value.map((sch) => (
                <div key={sch.id_jadwal} className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle space-y-1.5 w-full overflow-hidden">
                  <div className="flex items-center justify-between font-bold text-sm text-text-high gap-2">
                    <span className="truncate">{sch.nama_kegiatan}</span>
                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full border border-brand-primary/20 font-sans tabular-nums shrink-0">
                      {sch.tanggal}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted flex items-center gap-1 truncate">
                    <Clock className="w-3 h-3 text-text-disabled shrink-0" />
                    <span className="truncate">{sch.lokasi}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : pastoral.upcomingSchedules.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={pastoral.upcomingSchedules.reason} label={pastoral.upcomingSchedules.label} />
          ) : (
            <div className="p-6 border border-border-subtle bg-surface-sunken rounded-xl text-center space-y-1">
              <Calendar className="w-6 h-6 text-text-disabled mx-auto" />
              <p className="text-xs italic text-text-disabled">{pastoral.upcomingSchedules.label}</p>
            </div>
          )}
        </div>

        {/* Card 2: Pastoral Logs Timeline & Dokumentasi Foto */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-xs space-y-4 w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Rekam Giat &amp; Dokumentasi Pastoral</span>
            </h3>
            {pastoral.pastoralLogs.type === 'DATA' && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                {pastoral.pastoralLogs.value.length} Giat Terbaca
              </span>
            )}
          </div>

          {pastoral.pastoralLogs.type === 'DATA' ? (
            <div className="space-y-4 w-full">
              {pastoral.pastoralLogs.value.map((log) => (
                <div 
                  key={log.id_log} 
                  className="p-4 rounded-xl bg-surface-sunken border border-border-subtle space-y-3 transition-all hover:shadow-md w-full max-w-full overflow-hidden"
                >
                  {/* Header Item */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100/70 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {log.tipe_layanan}
                      </span>
                      {log.nama_pos && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-text-muted border border-border-subtle">
                          <MapPin className="w-3 h-3 text-text-muted" />
                          {log.nama_pos}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-text-muted bg-surface-elevated px-2.5 py-1 rounded-md border border-border-subtle shrink-0">
                      <Clock className="w-3 h-3 text-text-muted shrink-0" />
                      <span>{log.tanggal}</span>
                    </div>
                  </div>

                  {/* Foto Dokumentasi Node */}
                  {log.foto_url ? (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                        <Camera className="w-3 h-3 text-indigo-500" />
                        <span>Foto Dokumentasi Pelayanan</span>
                      </span>
                      <div 
                        onClick={() => setSelectedImage(log.foto_url!)}
                        className="relative group cursor-pointer overflow-hidden rounded-xl border border-border-subtle max-h-56 bg-black/5"
                      >
                        <img 
                          src={log.foto_url} 
                          alt={`Dokumentasi ${log.tipe_layanan}`} 
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                          <ImageIcon className="w-4 h-4" />
                          <span>Klik untuk memperbesar</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated border border-dashed border-border-subtle text-xs text-text-muted">
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <Camera className="w-3.5 h-3.5 text-text-muted" />
                        Dokumentasi foto belum diunggah
                      </span>
                      <span className="text-[10px] bg-surface-sunken px-1.5 py-0.5 rounded text-text-muted font-mono">Arsip Pos</span>
                    </div>
                  )}

                  {/* Notes Callout Box (Overflow Safe with break-words) */}
                  <div className="pt-2 text-xs w-full overflow-hidden">
                    {log.notes.type === 'DATA' ? (
                      <div className="p-3 rounded-xl bg-surface-elevated border-l-4 border-l-indigo-500 border-y border-r border-border-subtle shadow-2xs space-y-1 w-full overflow-hidden">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Catatan / Ringkasan Giat:</span>
                        <p className="text-text-high leading-relaxed font-medium whitespace-pre-line break-words w-full overflow-hidden">
                          {log.notes.value.replace(/\[(?:📷\s*)?FOTO_BASE64:\s*[^\]]+\]/gi, '').trim()}
                        </p>
                      </div>
                    ) : log.notes.type === 'PRIVACY_MASKED' ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 font-medium">
                        <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>Catatan pastoral ini bersifat rahasia (Self-Only)</span>
                      </div>
                    ) : (
                      <p className="italic text-text-muted">{log.notes.label}</p>
                    )}
                  </div>
                </div>
              ))}

              {pastoral.pagination.has_more && (
                <p className="text-[11px] text-center text-text-muted pt-1">
                  Menampilkan {pastoral.pastoralLogs.value.length} kegiatan terakhir
                </p>
              )}
            </div>
          ) : pastoral.pastoralLogs.type === 'PRIVACY_MASKED' ? (
            <PrivacyStateNotice reason={pastoral.pastoralLogs.reason} label={pastoral.pastoralLogs.label} />
          ) : (
            <div className="p-6 border border-dashed border-border-subtle rounded-xl text-center space-y-1">
              <FileText className="w-6 h-6 text-text-disabled mx-auto" />
              <p className="text-xs italic text-text-muted">{pastoral.pastoralLogs.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Photo Preview */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black p-2 border border-white/20 shadow-2xl">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedImage} 
              alt="Foto Pelayanan Pastoral" 
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};
