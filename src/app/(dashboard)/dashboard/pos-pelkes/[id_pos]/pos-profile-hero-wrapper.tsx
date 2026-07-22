'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Edit3, ArrowLeft, Building2, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/mobile/ShareButton';
import DeletePosButton from './delete-button';

interface PosProfileHeroWrapperProps {
  pos: {
    id_pos: string;
    nama_pos: string;
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
      mupel?: { nama_mupel: string } | null;
    } | null;
  };
  catLabel: string;
  catColor: string;
  totalKK: number;
  totalJiwa: number;
  canWrite: boolean;
  canDelete?: boolean;
}

export default function PosProfileHeroWrapper({
  pos,
  catLabel,
  catColor,
  totalKK,
  totalJiwa,
  canWrite,
  canDelete = false,
}: PosProfileHeroWrapperProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      {/* Top Action Bar Outside Hero */}
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/pos-pelkes"
            className="min-h-[40px] min-w-[40px] px-3 py-2 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(() => {
            const jemaatNama = pos.jemaat_induk?.nama_induk || '-';
            const mupelNama = pos.jemaat_induk?.mupel?.nama_mupel || '-';
            const posNama = pos.nama_pos || '-';
            const lat = pos.latitude || null;
            const lng = pos.longitude || null;

            let mapsUrl = '';
            if (lat && lng) {
              mapsUrl = `google.com/maps?q=${lat},${lng}`;
            } else {
              mapsUrl = `google.com/maps/search/?api=1&query=${encodeURIComponent(`GPIB ${posNama}`)}`;
            }

            const isBajemCat = catLabel.toLowerCase().includes('bajem') || posNama.toLowerCase().includes('bajem');
            const posHeaderLabel = isBajemCat ? 'Bajem' : 'Pos Pelkes';
            const tglFormatted = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            const updatedByStr = (pos as any).updated_by || 'Pelayan Pos';

            const shareTextLines = [
              `*PROFIL ${posHeaderLabel.toUpperCase()} GPIB*`,
              ``,
              `*${posNama.toUpperCase()}* (${posHeaderLabel})`,
              `_${jemaatNama} - ${mupelNama}_`,
              ``,
              `*INFORMASI UNIT PELAYANAN*`,
              `- Alamat: ${pos.alamat || 'Belum diisi'}`,
              `- Demografi: ${totalKK} KK | ${totalJiwa} Jiwa`,
              pos.tgl_berdiri ? `- Tanggal Berdiri: ${pos.tgl_berdiri}` : null,
              pos.keterangan ? `- Catatan: "${pos.keterangan}"` : null,
              ``,
              `*LOKASI & GOOGLE MAPS*`,
              `Peta Lokasi Google Maps:`,
              mapsUrl,
              ``,
              `Tanggal Share: ${tglFormatted}`,
              `Diperbarui Oleh: ${updatedByStr}`,
            ].filter(Boolean).join('\n');

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

      {/* Premium Hero Banner Showcase */}
      <div className="relative rounded-3xl overflow-hidden border border-border-subtle shadow-heavy bg-surface-elevated group">
        {/* Background Image / Gradient Showcase */}
        {pos.foto_url ? (
          <div 
            onClick={() => setShowLightbox(true)}
            className="relative h-56 sm:h-72 w-full overflow-hidden bg-black cursor-pointer"
            title="Klik untuk melihat foto full screen"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={pos.foto_url} 
              alt={`Foto Gedung ${pos.nama_pos}`} 
              className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Multi-layer Gradient Overlay for Text Readability & Aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />

            {/* Click to Enlarge Eye Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLightbox(true);
              }}
              className="absolute top-4 left-4 z-20 min-h-[36px] min-w-[36px] p-2 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-95 group-hover:scale-105"
              title="Lihat Foto Layar Penuh"
            >
              <Eye size={18} />
            </button>
          </div>
        ) : (
          <div className="relative h-44 sm:h-52 w-full bg-gradient-to-br from-brand-primary via-blue-900 to-indigo-950 p-6 overflow-hidden">
            <div className="absolute -right-12 -bottom-12 opacity-15 pointer-events-none">
              <Building2 className="w-80 h-80 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          </div>
        )}

        {/* Floating Content / Details Overlay */}
        <div className={`p-6 sm:p-8 ${pos.foto_url ? '-mt-36 sm:-mt-44 relative z-10 pointer-events-auto' : '-mt-24 sm:-mt-28 relative z-10'}`}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3 flex-1 min-w-0">
              {/* Badges Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-xs border backdrop-blur-md", catColor)}>
                  {catLabel}
                </span>
                <span className="text-xs font-mono font-bold tracking-wider px-3 py-1 rounded-xl bg-black/50 text-white border border-white/20 backdrop-blur-md shadow-xs">
                  {pos.id_pos}
                </span>
                {pos.jemaat_induk && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-white/10 text-white border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                    <span className="text-white/60">Induk:</span>
                    <Link 
                      href={`/hierarki/${encodeURIComponent(pos.jemaat_induk.id_mupel)}/${encodeURIComponent(pos.jemaat_induk.id_induk)}`}
                      className="text-amber-300 hover:underline font-bold"
                    >
                      {pos.jemaat_induk.nama_induk}
                    </Link>
                  </span>
                )}
              </div>

              {/* Title & Address */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {pos.nama_pos}
                </h1>
                {pos.alamat && (
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium max-w-2xl drop-shadow">
                    <MapPin className="inline-block w-4 h-4 mr-1.5 text-brand-primary-light shrink-0" />
                    {pos.alamat}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {showLightbox && pos.foto_url && (
        <div 
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <span className="text-white text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
              {pos.nama_pos}
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
