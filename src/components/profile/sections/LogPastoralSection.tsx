'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLogPastoralRingkas } from '@/hooks/use-profile';
import { FileText, Users, MapPin, Calendar, ArrowRight, Clock, Camera, X, Eye, Share2, Building, Layers } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { LogPastoralRingkasItem } from '@/types/profile.types';

interface LogPastoralSectionProps {
  idPendeta?: string | null;
}

export function LogPastoralSection({ idPendeta }: LogPastoralSectionProps) {
  const { data: logs, isLoading } = useLogPastoralRingkas(idPendeta);
  const [selectedLog, setSelectedLog] = useState<LogPastoralRingkasItem | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const extractMetaFromCatatan = (catatan?: string | null) => {
    if (!catatan) return { jamStr: null, zonaWaktu: null, photoBase64: null, hierarchyInfo: null, cleanNotes: '' };

    let jamStr: string | null = null;
    let zonaWaktu: string | null = null;
    let photoBase64: string | null = null;
    let hierarchyInfo: { mupelName?: string; jemaatName?: string; posName?: string } | null = null;
    let cleanNotes = catatan;

    const timeMatch = cleanNotes.match(/\[⏰ Jam Pelayanan:\s*([\d:]+)\s*(WIB|WITA|WIT)\]/);
    if (timeMatch) {
      jamStr = timeMatch[1];
      zonaWaktu = timeMatch[2];
      cleanNotes = cleanNotes.replace(/\[⏰ Jam Pelayanan:\s*[\d:]+\s*(WIB|WITA|WIT)\]\n?/, '');
    }

    const hierarchyMatch = cleanNotes.match(/\[🏛️ HIERARKI:\s*([^|]+)\|\s*([^|]+)\|\s*([^\]]+)\]/);
    if (hierarchyMatch) {
      hierarchyInfo = {
        mupelName: hierarchyMatch[1].trim(),
        jemaatName: hierarchyMatch[2].trim(),
        posName: hierarchyMatch[3].trim(),
      };
      cleanNotes = cleanNotes.replace(/\[🏛️ HIERARKI:\s*[^|]+\|\s*[^|]+\|\s*[^\]]+\]\n?/, '');
    }

    const photoMatch = cleanNotes.match(/\[📷 FOTO_BASE64:([\s\S]+?)\]/);
    if (photoMatch && photoMatch[1]) {
      photoBase64 = photoMatch[1].trim();
      cleanNotes = cleanNotes.replace(/\[📷 FOTO_BASE64:[\s\S]+?\]\n?/, '');
    }

    return { jamStr, zonaWaktu, photoBase64, hierarchyInfo, cleanNotes: cleanNotes.trim() };
  };

  const handleShareWhatsApp = (e: React.MouseEvent, log: LogPastoralRingkasItem) => {
    e.stopPropagation();
    const { jamStr, zonaWaktu, hierarchyInfo, cleanNotes } = extractMetaFromCatatan(log.catatan);
    const locName = log.nama_pos || hierarchyInfo?.posName || hierarchyInfo?.jemaatName || 'Pelayanan Pastoral';
    const lines = [
      `*LAPORAN PELAYANAN PASTORAL*`,
      `📍 ${locName}`,
      `📅 ${log.tgl_kegiatan} | Pkl. ${jamStr || '09:00'} ${zonaWaktu || 'WIB'}`,
      log.jumlah_jiwa > 0 ? `👥 Jumlah Jiwa: ${log.jumlah_jiwa} Jiwa` : null,
      `📝 Kegiatan: ${log.kegiatan}`,
      cleanNotes ? `\nCatatan:\n"${cleanNotes}"` : null,
    ].filter(Boolean).join('\n');

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="bg-surface-elevated p-6 rounded-2xl border border-border-subtle shadow-soft space-y-4 animate-pulse">
        <div className="h-5 bg-surface-sunken rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-40 bg-surface-sunken rounded-xl"></div>
          <div className="h-40 bg-surface-sunken rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle/60 pb-3">
        <h3 className="font-serif font-bold text-base text-text-high flex items-center gap-2">
          <FileText size={18} className="text-brand-primary" />
          <span>8 Log Pastoral Kunjungan Terakhir</span>
        </h3>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary">
          {logs?.length || 0} Terakhir
        </span>
      </div>

      {/* Cards Grid */}
      {logs && logs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {logs.map((log) => {
            const { jamStr, zonaWaktu, photoBase64, hierarchyInfo, cleanNotes } = extractMetaFromCatatan(log.catatan);

            let tglFormatted = log.tgl_kegiatan;
            try {
              tglFormatted = format(parseISO(log.tgl_kegiatan), 'dd MMM yyyy', { locale: localeId });
            } catch {}

            const locationName = log.nama_pos || hierarchyInfo?.posName || hierarchyInfo?.jemaatName || null;

            return (
              <div
                key={log.id_log}
                onClick={() => setSelectedLog(log)}
                className="p-4 rounded-2xl bg-surface-base border border-border-subtle hover:border-brand-primary/80 hover:shadow-medium transition-all space-y-2.5 group relative flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-2">
                  {/* Date, Time & Jiwa Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium text-text-muted bg-surface-sunken px-2 py-0.5 rounded-md">
                        <Calendar size={12} className="text-brand-primary" />
                        <span>{tglFormatted}</span>
                      </span>
                      {jamStr && (
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
                          <Clock size={11} />
                          <span>{jamStr} {zonaWaktu || 'WIB'}</span>
                        </span>
                      )}
                    </div>
                    {log.jumlah_jiwa > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Users size={11} /> {log.jumlah_jiwa} Jiwa
                      </span>
                    )}
                  </div>

                  {/* Title / Kegiatan */}
                  <h4 className="font-serif font-bold text-sm text-text-high leading-snug line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {log.kegiatan}
                  </h4>

                  {/* Location Info */}
                  {locationName && locationName !== '-' && (
                    <p className="text-xs text-brand-primary font-medium flex items-center gap-1 truncate">
                      <MapPin size={13} className="shrink-0" />
                      <span className="truncate">{locationName}</span>
                    </p>
                  )}

                  {/* Photo Thumbnail if available */}
                  {photoBase64 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewPhotoUrl(photoBase64);
                      }}
                      className="relative h-20 w-36 sm:w-44 rounded-xl overflow-hidden bg-black/90 border border-border-subtle cursor-zoom-in group/photo my-1"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoBase64}
                        alt="Foto Stamped"
                        className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-[3px] left-[3px] px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-bold flex items-center gap-1 backdrop-blur-sm border border-white/10">
                        <Camera size={9} className="text-amber-400" />
                        <span>Foto Dokumentasi</span>
                      </div>
                    </div>
                  )}

                  {/* Clean Notes without raw base64 tags */}
                  {cleanNotes && (
                    <p className="text-xs text-text-muted italic bg-surface-sunken p-2.5 rounded-xl border border-border-subtle/50 line-clamp-2 leading-relaxed">
                      "{cleanNotes}"
                    </p>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle/40 text-[11px] font-semibold text-brand-primary">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" onClick={(e) => handleShareWhatsApp(e, log)}>
                    <Share2 size={12} /> Share WA
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <Eye size={12} /> Detail
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-surface-sunken border border-border-subtle text-center text-xs text-text-muted space-y-1">
          <FileText size={28} className="mx-auto text-text-muted opacity-40 mb-2" />
          <p className="font-semibold text-text-high">Belum Ada Log Pastoral</p>
          <p>Belum ada catatan log pastoral kunjungan yang terdaftar di wilayah Anda.</p>
        </div>
      )}

      {/* Footer Link */}
      <div className="pt-3 border-t border-border-subtle/60 flex justify-end">
        <Link
          href="/dashboard/aktivitas"
          className="px-4 py-2 rounded-xl text-xs font-bold text-brand-primary hover:bg-brand-primary/10 transition-all flex items-center gap-1.5 min-h-[44px]"
        >
          <span>Lihat Semua Log Pastoral</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Modal Detail Log Pastoral */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-surface-elevated w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 border border-border-subtle shadow-heavy max-h-[85vh] overflow-y-auto space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <FileText size={18} />
                  <span>Detail Log Pastoral</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  ID Log: <strong className="text-text-high font-mono">{selectedLog.id_log}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            {(() => {
              const { jamStr, zonaWaktu, photoBase64, hierarchyInfo, cleanNotes } = extractMetaFromCatatan(selectedLog.catatan);

              return (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-base text-text-high leading-snug">
                      {selectedLog.kegiatan}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium bg-surface-sunken px-2.5 py-1 rounded-lg">
                        <Calendar size={13} className="text-brand-primary" />
                        {selectedLog.tgl_kegiatan}
                      </span>
                      {jamStr && (
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg">
                          <Clock size={13} />
                          {jamStr} {zonaWaktu || 'WIB'}
                        </span>
                      )}
                      {selectedLog.jumlah_jiwa > 0 && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          <Users size={13} />
                          {selectedLog.jumlah_jiwa} Jiwa Dilayani
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Photo Preview if available */}
                  {photoBase64 && (
                    <div
                      onClick={() => setPreviewPhotoUrl(photoBase64)}
                      className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-border-subtle cursor-zoom-in group/modalphoto"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoBase64}
                        alt="Foto Dokumentasi Full"
                        className="w-full h-full object-cover group-hover/modalphoto:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
                        <Camera size={13} className="text-amber-400" />
                        <span>Foto Dokumentasi</span>
                      </div>
                    </div>
                  )}

                  {/* Location & Hierarchy Info */}
                  <div className="bg-surface-base p-3 rounded-xl border border-border-subtle/70 space-y-1.5 text-xs">
                    {(selectedLog.nama_pos || hierarchyInfo?.posName) && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted flex items-center gap-1.5 font-medium">
                          <MapPin size={13} className="text-brand-primary" /> Pos Pelkes / Bajem:
                        </span>
                        <span className="font-bold text-text-high">
                          {selectedLog.nama_pos || hierarchyInfo?.posName}
                        </span>
                      </div>
                    )}

                    {hierarchyInfo?.jemaatName && (
                      <div className="flex items-center justify-between border-t border-border-subtle/40 pt-1.5">
                        <span className="text-text-muted flex items-center gap-1.5">
                          <Building size={13} className="text-blue-500" /> Jemaat Induk:
                        </span>
                        <span className="font-bold text-text-high">
                          {hierarchyInfo.jemaatName}
                        </span>
                      </div>
                    )}

                    {hierarchyInfo?.mupelName && (
                      <div className="flex items-center justify-between border-t border-border-subtle/40 pt-1.5">
                        <span className="text-text-muted flex items-center gap-1.5">
                          <Layers size={13} className="text-purple-500" /> Mupel:
                        </span>
                        <span className="font-bold text-text-high">
                          {hierarchyInfo.mupelName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Clean Notes */}
                  {cleanNotes && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-high">Catatan Pastoral:</label>
                      <p className="text-xs text-text-high italic bg-surface-sunken p-3 rounded-xl border border-border-subtle/60 leading-relaxed whitespace-pre-line">
                        "{cleanNotes}"
                      </p>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={(e) => handleShareWhatsApp(e, selectedLog)}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all min-h-[44px] flex items-center gap-1.5 shadow-soft"
                    >
                      <Share2 size={16} />
                      <span>Bagikan ke WA</span>
                    </button>

                    <Link
                      href="/dashboard/aktivitas"
                      className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark transition-all shadow-soft min-h-[44px] flex items-center justify-center gap-1.5"
                    >
                      <span>Buka di Halaman Laporan</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-2xl w-full bg-surface-elevated rounded-2xl overflow-hidden border border-border-subtle p-2 space-y-2">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-xs font-bold text-text-high flex items-center gap-1.5">
                <Camera size={14} className="text-brand-primary" />
                Foto Dokumentasi
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-high hover:bg-surface-sunken"
              >
                <X size={18} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewPhotoUrl} alt="Foto Stamped Full" className="w-full max-h-[75vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
