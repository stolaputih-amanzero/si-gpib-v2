'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Edit3, ArrowLeft, Building2, Eye, X, TrendingUp, Church, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/mobile/ShareButton';
import DeletePosButton from './delete-button';
import { PosName } from '@/components/ui/PosName';
import { normalizePosName } from '@/lib/utils/normalize-pos-name';
import { StatusElevationModal } from '@/components/hierarki/StatusElevationModal';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';

interface PosProfileHeroWrapperProps {
  pos: {
    id_pos: string;
    id_induk?: string | null;
    nama_pos: string;
    kategori?: string | null;
    alamat: string | null;
    foto_url?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    tgl_berdiri?: string | null;
    keterangan?: string | null;
    updated_by?: string | null;
    jemaat_induk: {
      nama_induk: string;
      id_induk: string;
      id_mupel: string;
      keterangan?: string | null;
      mupel?: { id_mupel: string; nama_mupel: string } | null;
    } | null;
  };
  catLabel: string;
  catColor: string;
  totalKK: number;
  totalJiwa: number;
  canWrite: boolean;
  canDelete?: boolean;
  pjName?: string | null;
  jadwalList?: Array<{ jenis: string; hari: string; jam: string; zona_waktu?: string | null; keterangan?: string | null }>;
  historiList?: any[];
  currentUserName?: string;
}

export default function PosProfileHeroWrapper({
  pos,
  catLabel,
  catColor,
  totalKK,
  totalJiwa,
  canWrite,
  canDelete = false,
  pjName,
  jadwalList,
  historiList,
  currentUserName,
}: PosProfileHeroWrapperProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [isElevateModalOpen, setIsElevateModalOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const canElevate = canWrite && isSuperUserRole(currentUser?.role);

  const isElevated = Boolean(
    pos.kategori === 'Jemaat Induk' ||
    pos.kategori === 'Jemaat Induk Mandiri' ||
    pos.id_pos === pos.id_induk ||
    pos.jemaat_induk?.keterangan?.includes('Ditingkatkan dari') ||
    (historiList && historiList.some((h: any) => 
      h.status_baru === 'Jemaat Induk' || 
      h.status_baru === 'JEMAAT_INDUK' ||
      (h.id_induk_baru && pos.id_induk && h.id_induk_baru === pos.id_induk)
    ))
  );

  return (
    <>
      {/* Top Action Bar Outside Hero */}
      <div className="flex items-center justify-between gap-2.5 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/pos-pelkes"
            className="min-h-[40px] px-3 py-2 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(() => {
            const jemaatNama = pos.jemaat_induk?.nama_induk || '-';
            const mupelNama = pos.jemaat_induk?.mupel?.nama_mupel || pos.jemaat_induk?.id_mupel || '-';
            const posNama = normalizePosName(pos.nama_pos) || pos.nama_pos || '-';
            const lat = pos.latitude || null;
            const lng = pos.longitude || null;

            let mapsUrl = '';
            if (lat && lng) {
              mapsUrl = `google.com/maps?q=${lat},${lng}`;
            } else {
              const queryStr = pos.alamat 
                ? `${posNama}, ${pos.alamat}` 
                : `${posNama}, GPIB ${jemaatNama}`;
              mapsUrl = `google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;
            }

            const isBajemCat = catLabel.toLowerCase().includes('bajem') || posNama.toLowerCase().includes('bajem');
            const posHeaderLabel = isBajemCat ? 'Bajem' : 'Pos Pelkes';
            const tglFormatted = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            const updatedByStr = (pos as any).updated_by || currentUserName || 'Pelayan Pos';

            // Format Jadwal Ibadah
            let jadwalStr = 'Belum ada jadwal ibadah terdaftar';
            if (jadwalList && jadwalList.length > 0) {
              jadwalStr = jadwalList
                .map((j) => `- ${j.jenis} | ${j.hari}, Pkl. ${j.jam.substring(0, 5)} ${j.zona_waktu || 'WIB'}${j.keterangan ? ` (${j.keterangan})` : ''}`)
                .join('\n');
            }

            const rawTextLines = [
              `*PROFIL ${posHeaderLabel.toUpperCase()} GPIB*`,
              ``,
              `*${posNama.toUpperCase()}* (${posHeaderLabel})`,
              `_${jemaatNama} - ${mupelNama}_`,
              ``,
              `*INFORMASI UNIT PELAYANAN*`,
              `- MUPEL: ${mupelNama}`,
              `- Jemaat Induk: ${jemaatNama}`,
              `- Alamat: ${pos.alamat || 'Belum diisi'}`,
              `- Demografi: ${totalKK} KK | ${totalJiwa} Jiwa`,
              pos.tgl_berdiri ? `- Tanggal Berdiri: ${pos.tgl_berdiri}` : null,
              pos.keterangan ? `- Catatan: "${pos.keterangan}"` : null,
              ``,
              `*PENDETA / PENANGGUNG JAWAB (PJ)*`,
              `- Pendeta PJ: ${pjName || 'Belum ditugaskan'}`,
              ``,
              `*JADWAL IBADAH RUTIN*`,
              jadwalStr,
              ``,
              `*LOKASI & GOOGLE MAPS*`,
              `Peta Lokasi Google Maps:`,
              mapsUrl,
              ``,
              `Tanggal Share: ${tglFormatted}`,
              `Diperbarui Oleh: ${updatedByStr}`,
            ];

            const shareTextLines = rawTextLines
              .filter((line) => line !== null && line !== undefined)
              .join('\n');

            return (
              <ShareButton
                title={`Profil ${posHeaderLabel}: ${posNama}`}
                text={shareTextLines}
                imageUrl={pos.foto_url}
                variant="ghost"
                iconOnly
              />
            );
          })()}

          {canElevate && (
            <button
              type="button"
              onClick={() => setIsElevateModalOpen(true)}
              title={`Tingkatkan Status ${pos.nama_pos}`}
              className="min-h-[40px] px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
            >
              <TrendingUp size={16} />
              <span className="hidden sm:inline">Tingkatkan Status</span>
            </button>
          )}

          {canWrite && (
            <Link
              href={`/dashboard/pos-pelkes/${pos.id_pos}/edit`}
              title={`Edit Data ${pos.nama_pos}`}
              className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl border border-border-subtle bg-surface-elevated hover:bg-surface-sunken text-brand-primary flex items-center justify-center transition-all active:scale-95 shadow-xs"
            >
              <Edit3 size={16} />
            </Link>
          )}

          {canDelete && (
            <DeletePosButton id_pos={pos.id_pos} nama_pos={pos.nama_pos} iconOnly />
          )}
        </div>
      </div>

      {/* Modal Peningkatan Status (Elevasi) */}
      {isElevateModalOpen && (
        <StatusElevationModal
          isOpen={isElevateModalOpen}
          onClose={() => setIsElevateModalOpen(false)}
          posItem={{
            id_pos: pos.id_pos,
            nama_pos: pos.nama_pos,
            kategori: (pos as any).kategori || catLabel,
            id_induk: pos.jemaat_induk?.id_induk || '',
          }}
        />
      )}

      {/* Premium Hero Banner Showcase */}
      <div className="rounded-3xl overflow-hidden border border-border-subtle shadow-soft bg-surface-elevated">
        {/* Background Image Showcase */}
        {pos.foto_url ? (
          <div 
            onClick={() => setShowLightbox(true)}
            className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-surface-sunken cursor-pointer group"
            title="Klik untuk melihat foto layar penuh"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={pos.foto_url} 
              alt={`Foto Gedung ${pos.nama_pos}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {/* Dark Gradient Backdrop at Bottom for Title Readability */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

            {/* Title Overlay at bottom of photo (Tanpa Alamat) */}
            <div className="absolute bottom-3 left-4 right-14 z-10 pointer-events-none">
              <h1 className="text-lg sm:text-2xl font-black text-white drop-shadow-md leading-snug uppercase tracking-wide">
                <PosName name={pos.nama_pos} className="text-white uppercase" uppercase />
              </h1>
            </div>

            {/* Click to Enlarge Eye Button (Icon-only) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLightbox(true);
              }}
              className="absolute bottom-3 right-3 z-20 min-h-[40px] min-w-[40px] p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-95"
              title="Lihat Foto Layar Penuh"
            >
              <Eye size={18} />
            </button>
          </div>
        ) : (
          <div className="relative h-36 sm:h-48 w-full bg-gradient-to-br from-brand-primary via-blue-900 to-indigo-950 p-4 sm:p-6 overflow-hidden flex flex-col justify-end">
            <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
              <Building2 className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10">
              <h1 className="text-lg sm:text-2xl font-black text-white drop-shadow-md leading-snug uppercase tracking-wide">
                <PosName name={pos.nama_pos} className="text-white uppercase" uppercase />
              </h1>
            </div>
          </div>
        )}

        {/* Info Details Section Below Image (Badges & Alamat) */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Badges Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-xs border", catColor)}>
              {catLabel}
            </span>
            {pos.jemaat_induk && (
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-surface-sunken text-text-muted border border-border-subtle flex items-center gap-1.5">
                <span>Induk:</span>
                <Link 
                  href={`/hierarki/${encodeURIComponent(pos.jemaat_induk.id_mupel)}/${encodeURIComponent(pos.jemaat_induk.id_induk)}`}
                  className="text-brand-primary hover:underline font-bold"
                >
                  {pos.jemaat_induk.nama_induk}
                </Link>
              </span>
            )}
          </div>

          {/* Address Below Photo */}
          {pos.alamat && (
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-medium flex items-start gap-1.5 pt-0.5">
              <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <span>{pos.alamat}</span>
            </p>
          )}
        </div>
      </div>

      {/* Banner Notifikasi Peningkatan Status ke Jemaat Induk */}
      {isElevated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-brand-primary text-white shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-purple-500/30 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0 border border-white/20">
              <Church size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-purple-950 px-2 py-0.5 rounded">
                  Status Terkini: Mandiri
                </span>
                <span className="text-xs font-bold text-purple-200">Telah Ditingkatkan Statusnya</span>
              </div>
              <h3 className="text-base font-extrabold text-white leading-snug">
                {pos.jemaat_induk?.nama_induk || pos.nama_pos}
              </h3>
              <p className="text-xs text-purple-200 leading-relaxed">
                Unit pelayanan ini telah secara resmi bertransformasi menjadi Jemaat Induk Mandiri dalam hierarki GPIB.
              </p>
            </div>
          </div>

          {pos.jemaat_induk && (
            <Link
              href={`/hierarki/${encodeURIComponent(pos.jemaat_induk.id_mupel)}/${encodeURIComponent(pos.jemaat_induk.id_induk)}`}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 w-full sm:w-auto"
            >
              <span>Halaman Jemaat Induk</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {showLightbox && pos.foto_url && (
        <div 
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <span className="text-white text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md uppercase tracking-wider">
              <PosName name={pos.nama_pos} className="text-white uppercase" uppercase />
            </span>
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={pos.foto_url} 
              alt={`Foto Gedung ${pos.nama_pos}`} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          <p className="text-white/70 text-xs mt-3 font-medium">Klik di mana saja untuk menutup tampilan layar penuh</p>
        </div>
      )}
    </>
  );
}
