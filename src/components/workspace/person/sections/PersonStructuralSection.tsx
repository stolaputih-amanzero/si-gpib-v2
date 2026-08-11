import { LegacyUnifiedPersonData as UnifiedPersonData } from '../legacyTypes';
import { Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';

export function PersonStructuralSection({ personData }: { personData: UnifiedPersonData }) {
  const jabatan = personData.jabatan || [];

  if (jabatan.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-dashed border-border-subtle rounded-2xl animate-tab-fade">
        <Briefcase size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-bold text-text-strong text-lg">Belum ada riwayat jabatan</h3>
        <p className="text-sm text-text-muted mt-1">Data jabatan struktural akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-tab-fade pb-8 relative before:absolute before:inset-y-0 before:left-[27px] before:w-0.5 before:bg-border-subtle">
      {jabatan.map((j, i) => (
        <div key={j.id_jabatan || i} className="relative pl-14 pb-2">
          <div className="absolute left-5 top-1 w-4 h-4 rounded-full bg-surface-1 border-2 border-brand-primary z-10 ring-4 ring-surface-sunken" />
          <div className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs">
            <h4 className="font-bold text-text-strong">{j.nama_jabatan}</h4>
            <p className="text-xs font-bold text-brand-primary mt-1">{j.tingkat_jabatan}</p>
            <div className="flex items-center gap-2 text-xs text-text-muted mt-2">
              <span>{format(new Date(j.tgl_mulai), 'MMM yyyy', { locale: dateFnsId })}</span>
              <span>—</span>
              <span>{j.tgl_selesai ? format(new Date(j.tgl_selesai), 'MMM yyyy', { locale: dateFnsId }) : 'Sekarang'}</span>
            </div>
            {j.keterangan && <p className="text-sm text-text-strong mt-3 pt-3 border-t border-border-subtle">{j.keterangan}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
