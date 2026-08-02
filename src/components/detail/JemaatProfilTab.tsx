'use client';

import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Church, Home, Users, User, MapPin, Building2, Navigation, ExternalLink, Activity, Compass } from 'lucide-react';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { InfoBlock } from '@/components/detail/InfoBlock';
import { LeadershipBlock } from '@/components/detail/LeadershipBlock';
import { JemaatIndukDetailData } from '@/hooks/use-jemaat-detail';
import { PendetaItemByJemaat } from '@/hooks/use-pendeta-by-jemaat';

export interface JemaatProfilTabProps {
  jemaat: JemaatIndukDetailData;
  stats: {
    totalPos: number;
    totalKK: number;
    totalJiwa: number;
    totalLaki: number;
    totalPerempuan: number;
  };
  kmj?: PendetaItemByJemaat | null;
  pjs?: PendetaItemByJemaat[];
}

export function JemaatProfilTab({ jemaat, stats, kmj, pjs = [] }: JemaatProfilTabProps) {
  // Format last updated date
  let lastUpdatedFormatted: string | null = null;
  if (jemaat.updated_at) {
    try {
      lastUpdatedFormatted = format(new Date(jemaat.updated_at), 'd MMM yyyy, HH:mm', { locale: idLocale });
    } catch {
      lastUpdatedFormatted = jemaat.updated_at;
    }
  }

  return (
    <div className="space-y-4 animate-tab-fade">
      {/* 1. StatStrip (Pita Jiwa 5 Metrik) */}
      <SummaryStrip
        metrics={[
          { label: 'Pos Pelkes', value: stats.totalPos, icon: <Church size={16} className="text-brand-primary" /> },
          { label: 'Jumlah KK', value: stats.totalKK, icon: <Home size={16} className="text-emerald-600 dark:text-emerald-400" /> },
          { label: 'Total Jiwa', value: stats.totalJiwa, icon: <Users size={16} className="text-indigo-600 dark:text-indigo-400" /> },
          { label: 'Laki-Laki', value: stats.totalLaki, icon: <User size={16} className="text-blue-600 dark:text-blue-400" /> },
          { label: 'Perempuan', value: stats.totalPerempuan, icon: <User size={16} className="text-pink-600 dark:text-pink-400" /> },
        ]}
        className="bg-surface-1/60 rounded-2xl py-2 px-3 border border-border-subtle shadow-2xs flex-wrap"
      />

      {/* 2. Kepemimpinan Jemaat (LeadershipBlock: KMJ 1:1 & PJ 0:N) */}
      <LeadershipBlock kmj={kmj} pjs={pjs} />

      {/* 3. Hairline InfoBlock Container (100% REUSE InfoBlock) */}
      <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden divide-y divide-line-hairline">
        {/* Jemaat Induk Nama */}
        <InfoBlock
          icon={<Church className="w-4 h-4 text-brand-primary" />}
          label="Jemaat Induk"
          value={
            <span className="flex items-center gap-2">
              <span>{jemaat.nama_induk}</span>
              <span className="text-xs font-mono font-medium text-text-tertiary">({jemaat.id_induk})</span>
            </span>
          }
        />

        {/* Musyawarah Pelayanan (Mupel) */}
        <InfoBlock
          icon={<Building2 className="w-4 h-4 text-brand-primary" />}
          label="Musyawarah Pelayanan (Mupel)"
          value={
            jemaat.mupel ? (
              <span className="flex items-center gap-2">
                <span>{jemaat.mupel.nama_mupel}</span>
                <span className="text-xs font-mono font-medium text-text-tertiary">({jemaat.mupel.id_mupel})</span>
              </span>
            ) : null
          }
          href={jemaat.mupel ? `/hierarki/${encodeURIComponent(jemaat.mupel.id_mupel)}` : undefined}
        />

        {/* Alamat */}
        <InfoBlock
          icon={<MapPin className="w-4 h-4 text-brand-primary" />}
          label="Alamat Lengkap"
          value={jemaat.alamat}
        />

        {/* Koordinat GPS (Business Rule #11) */}
        {jemaat.latitude && jemaat.longitude && (
          <InfoBlock
            icon={<Navigation className="w-4 h-4 text-brand-primary" />}
            label="Koordinat Lokasi GPS"
            value={`Lat: ${jemaat.latitude}, Lng: ${jemaat.longitude}`}
            href={`https://www.google.com/maps/dir/?api=1&destination=${jemaat.latitude},${jemaat.longitude}`}
            trailing={<ExternalLink size={14} className="text-text-tertiary" />}
          />
        )}

        {/* Catatan Keterangan */}
        <InfoBlock
          icon={<Compass className="w-4 h-4 text-brand-primary" />}
          label="Catatan Keterangan"
          value={jemaat.keterangan}
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

export default JemaatProfilTab;
