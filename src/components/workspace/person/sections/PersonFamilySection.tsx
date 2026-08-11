import { LegacyUnifiedPersonData as UnifiedPersonData } from '../legacyTypes';
import { Users, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import { PrivateDataNotice } from './PrivateDataNotice';

export function PersonFamilySection({ personData }: { personData: UnifiedPersonData }) {
  if (!personData.can_see_private || personData.keluarga === null) {
    return <PrivateDataNotice />;
  }

  const keluarga = personData.keluarga || [];

  if (keluarga.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-dashed border-border-subtle rounded-2xl animate-tab-fade">
        <Users size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-bold text-text-strong text-lg">Belum ada data keluarga</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-tab-fade pb-8">
      {keluarga.map((k, i) => (
        <div key={k.id_keluarga || i} className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs flex items-start gap-3">
          <div className="p-2 bg-rose-50 text-rose-500 rounded-lg shrink-0 mt-0.5">
            <Heart size={16} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-text-strong">{k.nama_anggota}</h4>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-surface-sunken text-text-muted rounded-full">
                {k.hubungan}
              </span>
            </div>
            
            <div className="mt-2 text-xs text-text-muted flex flex-col gap-1">
              <p>Tempat, Tgl Lahir: {k.tempat_lahir || '-'}, {k.tgl_lahir ? format(new Date(k.tgl_lahir), 'dd MMM yyyy', { locale: dateFnsId }) : '-'}</p>
              <p>Pekerjaan: {k.pekerjaan || '-'}</p>
              {k.keterangan && <p className="mt-1 pt-1 border-t border-border-subtle">Ket: {k.keterangan}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
