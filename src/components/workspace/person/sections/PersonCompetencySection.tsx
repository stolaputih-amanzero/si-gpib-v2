import { LegacyUnifiedPersonData as UnifiedPersonData } from '../legacyTypes';
import { FileText, Award } from 'lucide-react';

export function PersonCompetencySection({ personData }: { personData: UnifiedPersonData }) {
  const kompetensi = personData.kompetensi || [];

  if (kompetensi.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-dashed border-border-subtle rounded-2xl animate-tab-fade">
        <FileText size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-bold text-text-strong text-lg">Belum ada data kompetensi</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-tab-fade pb-8">
      {kompetensi.map((k, i) => (
        <div key={k.id_kompetensi || i} className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs flex items-start gap-3">
          <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0 mt-0.5">
            <Award size={16} />
          </div>
          <div>
            <h4 className="font-bold text-text-strong text-sm">{k.nama_kompetensi || k.nama_pelatihan}</h4>
            <p className="text-xs font-medium text-brand-primary mt-0.5">{k.penyelenggara}</p>
            <div className="mt-2 flex gap-3 text-xs text-text-muted">
              {k.tahun && <span>Tahun: {k.tahun}</span>}
              {k.no_sertifikat && <span>No. Sertifikat: {k.no_sertifikat}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
