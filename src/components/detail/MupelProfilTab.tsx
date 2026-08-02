'use client';

import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Church, Home, Users, User, Layers, Activity, Compass, Sprout } from 'lucide-react';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { InfoBlock } from '@/components/detail/InfoBlock';
import { AdminMupelBlock } from '@/components/detail/AdminMupelBlock';
import { MupelDetailData } from '@/hooks/use-mupel-detail';
import { AdminMupelUser } from '@/hooks/use-admin-mupel';
import { MupelStats } from '@/lib/utils/mupel-stats';

export interface MupelProfilTabProps {
  mupel: MupelDetailData;
  stats: MupelStats;
  admins?: AdminMupelUser[];
}

export function MupelProfilTab({ mupel, stats, admins = [] }: MupelProfilTabProps) {
  // Format last updated date
  let lastUpdatedFormatted: string | null = null;
  if (mupel.updated_at) {
    try {
      lastUpdatedFormatted = format(new Date(mupel.updated_at), 'd MMM yyyy, HH:mm', { locale: idLocale });
    } catch {
      lastUpdatedFormatted = mupel.updated_at;
    }
  }

  return (
    <div className="space-y-4 animate-tab-fade">
      {/* 1. StatStrip (Pita statistik 5 Metrik Mupel) */}
      <SummaryStrip
        metrics={[
          { label: 'Jemaat Induk', value: stats.totalJemaat, icon: <Church size={16} className="text-indigo-600 dark:text-indigo-400" /> },
          { label: 'Pos Pelkes', value: stats.totalPos, icon: <Sprout size={16} className="text-emerald-600 dark:text-emerald-400" /> },
          { label: 'Total Pendeta', value: stats.totalPendeta, icon: <User size={16} className="text-brand-primary" /> },
          { label: 'Total KK', value: stats.totalKK, icon: <Home size={16} className="text-blue-600 dark:text-blue-400" /> },
          { label: 'Total Jiwa', value: stats.totalJiwa, icon: <Users size={16} className="text-purple-600 dark:text-purple-400" /> },
        ]}
        className="bg-surface-1/60 rounded-2xl py-2 px-3 border border-border-subtle shadow-2xs flex-wrap"
      />

      {/* 2. Admin Mupel Leadership Block */}
      <AdminMupelBlock admins={admins} />

      {/* 3. Hairline InfoBlock Container (100% REUSE InfoBlock) */}
      <div className="bg-surface-1 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden divide-y divide-line-hairline">
        {/* Nama Mupel */}
        <InfoBlock
          icon={<Layers className="w-4 h-4 text-brand-primary" />}
          label="Musyawarah Pelayanan (Mupel)"
          value={
            <span className="flex items-center gap-2">
              <span>{mupel.nama_mupel}</span>
              <span className="text-xs font-mono font-medium text-text-tertiary">({mupel.id_mupel})</span>
            </span>
          }
        />

        {/* Catatan Keterangan */}
        <InfoBlock
          icon={<Compass className="w-4 h-4 text-brand-primary" />}
          label="Catatan Keterangan"
          value={mupel.keterangan}
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

export default MupelProfilTab;
