'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Home, Users, User, MapPin, Building2, Calendar, Navigation, ExternalLink, Activity, Phone, Compass, UserCheck } from 'lucide-react';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { InfoBlock } from '@/components/detail/InfoBlock';

export interface ProfilTabProps {
  pos: {
    id_pos: string;
    id_induk: string;
    nama_pos: string;
    kategori: string | null;
    alamat: string | null;
    latitude: number | null;
    longitude: number | null;
    tgl_berdiri: string | null;
    keterangan: string | null;
    jumlah_kk?: number | null;
    jumlah_jiwa?: number | null;
    updated_at?: string | null;
    updated_by?: string | null;
    jemaat_induk?: {
      id_induk: string;
      nama_induk: string;
      id_mupel: string;
      mupel?: {
        id_mupel: string;
        nama_mupel: string;
      } | null;
    } | null;
  };
  demografi?: any[];
  pj?: {
    id_pendeta: string;
    nama_lengkap: string;
    no_wa: string | null;
    status_tugas?: string;
    foto_url?: string | null;
  } | null;
}

export function ProfilTab({ pos, demografi = [], pj }: ProfilTabProps) {
  // Demografi Totals
  const demoKK = demografi?.reduce((acc: number, curr: any) => acc + (curr.jml_kk || 0), 0) || 0;
  const demoLaki = demografi?.reduce((acc: number, curr: any) => acc + (curr.laki || 0), 0) || 0;
  const demoPerempuan = demografi?.reduce((acc: number, curr: any) => acc + (curr.perempuan || 0), 0) || 0;
  const demoJiwa = demoLaki + demoPerempuan;

  const totalKK = demoKK || pos.jumlah_kk || 0;
  const totalJiwa = demoJiwa || pos.jumlah_jiwa || 0;

  // Format date berdiri
  let tglBerdiriFormatted: string | null = null;
  if (pos.tgl_berdiri) {
    try {
      tglBerdiriFormatted = format(new Date(pos.tgl_berdiri), 'd MMMM yyyy', { locale: idLocale });
    } catch {
      tglBerdiriFormatted = pos.tgl_berdiri;
    }
  }

  // Format last updated
  let lastUpdatedFormatted: string | null = null;
  if (pos.updated_at) {
    try {
      const formattedDate = format(new Date(pos.updated_at), 'd MMM yyyy, HH:mm', { locale: idLocale });
      lastUpdatedFormatted = `${formattedDate} WIB ${pos.updated_by ? `oleh ${pos.updated_by}` : ''}`;
    } catch {
      lastUpdatedFormatted = pos.updated_at;
    }
  }

  return (
    <div className="space-y-4 animate-tab-fade">
      {/* 1. StatStrip Demografi (Pita Jiwa) */}
      <SummaryStrip
        metrics={[
          { label: 'Jumlah KK', value: totalKK, icon: <Home size={16} className="text-emerald-600 dark:text-emerald-400" /> },
          { label: 'Total Jiwa', value: totalJiwa, icon: <Users size={16} className="text-brand-primary" /> },
          { label: 'Laki-Laki', value: demoLaki, icon: <User size={16} className="text-blue-600 dark:text-blue-400" /> },
          { label: 'Perempuan', value: demoPerempuan, icon: <User size={16} className="text-pink-600 dark:text-pink-400" /> },
        ]}
        className="bg-surface-1/60 rounded-2xl py-2 px-3 border border-border-subtle shadow-2xs"
      />

      {/* 2. Pendeta Penanggung Jawab (PJ) Quick Card */}
      {pj && (
        <div className="bg-surface-1 p-3.5 rounded-2xl border border-border-subtle shadow-2xs flex items-center justify-between gap-3">
          <Link
            href={`/pendeta/${pj.id_pendeta}`}
            className="flex items-center gap-3 min-w-0 flex-1 group"
          >
            {pj.foto_url ? (
              <img
                src={pj.foto_url}
                alt={pj.nama_lengkap}
                className="w-11 h-11 rounded-xl object-cover border border-border-subtle shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                {pj.nama_lengkap.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  PJ
                </span>
                <span className="text-[10px] text-text-tertiary font-medium">Pendeta Jemaat</span>
              </div>
              <h4 className="font-extrabold text-sm text-text-high truncate group-hover:text-brand-primary transition-colors">
                {pj.nama_lengkap}
              </h4>
              <p className="text-xs text-text-muted">
                Status: {pj.status_tugas || 'Aktif'}
              </p>
            </div>
          </Link>

          {pj.no_wa && (
            <a
              href={`https://wa.me/${pj.no_wa.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-all min-h-[44px] min-w-[44px] shrink-0"
              title={`WhatsApp ${pj.nama_lengkap}`}
            >
              <Phone size={16} />
            </a>
          )}
        </div>
      )}

      {/* 3. Information Blocks Container (Hairline List) */}
      <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden divide-y divide-line-hairline">
        {/* PJ Baris */}
        {pj && (
          <InfoBlock
            icon={<UserCheck className="w-4 h-4 text-brand-primary" />}
            label="Pendeta Penanggung Jawab (PJ)"
            value={pj.nama_lengkap}
            href={`/pendeta/${pj.id_pendeta}`}
          />
        )}

        {/* Jemaat Induk Baris */}
        <InfoBlock
          icon={<Building2 className="w-4 h-4 text-brand-primary" />}
          label="Jemaat Induk Pengampu"
          value={
            pos.jemaat_induk ? (
              <span className="flex items-center gap-2">
                <span>{pos.jemaat_induk.nama_induk}</span>
                <span className="text-xs font-mono font-medium text-text-tertiary">
                  ({pos.jemaat_induk.id_induk})
                </span>
              </span>
            ) : null
          }
          href={
            pos.jemaat_induk
              ? `/hierarki/${encodeURIComponent(pos.jemaat_induk.id_mupel)}/${encodeURIComponent(pos.jemaat_induk.id_induk)}`
              : undefined
          }
        />

        {/* Mupel Baris */}
        <InfoBlock
          icon={<Home className="w-4 h-4 text-brand-primary" />}
          label="Musyawarah Pelayanan (Mupel)"
          value={pos.jemaat_induk?.mupel?.nama_mupel}
          href={
            pos.jemaat_induk?.mupel
              ? `/hierarki/${encodeURIComponent(pos.jemaat_induk.mupel.id_mupel)}`
              : undefined
          }
        />

        {/* Tanggal Berdiri */}
        <InfoBlock
          icon={<Calendar className="w-4 h-4 text-brand-primary" />}
          label="Berdiri Sejak"
          value={tglBerdiriFormatted}
        />

        {/* Alamat */}
        <InfoBlock
          icon={<MapPin className="w-4 h-4 text-brand-primary" />}
          label="Alamat Lengkap"
          value={pos.alamat}
        />

        {/* Koordinat GPS */}
        {pos.latitude && pos.longitude && (
          <InfoBlock
            icon={<Navigation className="w-4 h-4 text-brand-primary" />}
            label="Koordinat Lokasi GPS"
            value={`Lat: ${pos.latitude}, Lng: ${pos.longitude}`}
            href={`https://www.google.com/maps/dir/?api=1&destination=${pos.latitude},${pos.longitude}`}
            trailing={<ExternalLink size={14} className="text-text-tertiary" />}
          />
        )}

        {/* Catatan Keterangan */}
        <InfoBlock
          icon={<Compass className="w-4 h-4 text-brand-primary" />}
          label="Catatan Keterangan"
          value={pos.keterangan}
        />

        {/* Terakhir Diperbarui */}
        <InfoBlock
          icon={<Activity className="w-4 h-4 text-brand-primary" />}
          label="Terakhir Diperbarui"
          value={lastUpdatedFormatted}
        />
      </div>
    </div>
  );
}

export default ProfilTab;
