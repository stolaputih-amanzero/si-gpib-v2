import { LegacyUnifiedPersonData as UnifiedPersonData } from '../legacyTypes';
import { Shield, Globe } from 'lucide-react';

export function PersonInvolvementSection({ personData }: { personData: UnifiedPersonData }) {
  const keterlibatan = personData.keterlibatan || [];

  if (keterlibatan.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-dashed border-border-subtle rounded-2xl animate-tab-fade">
        <Shield size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-bold text-text-strong text-lg">Belum ada data keterlibatan</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-tab-fade pb-8">
      {keterlibatan.map((k, i) => (
        <div key={k.id_keterlibatan || i} className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs flex items-start gap-3">
          <div className="p-2 bg-amber-50 text-amber-500 rounded-lg shrink-0 mt-0.5">
            <Globe size={16} />
          </div>
          <div>
            <h4 className="font-bold text-text-strong text-sm">{k.nama_organisasi}</h4>
            <p className="text-xs font-bold text-text-muted mt-0.5 uppercase tracking-wide">{k.peran}</p>
            <div className="mt-2 text-xs text-text-muted">
              {k.tgl_mulai && <span>Mulai: {k.tgl_mulai}</span>}
              {k.tgl_selesai && <span> — Selesai: {k.tgl_selesai}</span>}
            </div>
            {k.keterangan && <p className="text-sm mt-2 text-text-strong">{k.keterangan}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
