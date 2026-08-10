import { UnifiedPersonData } from '@/lib/services/person';
import { Activity, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';

export function PersonPastoralLogSection({ personData }: { personData: UnifiedPersonData }) {
  const logs = personData.log_pastoral || [];

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-dashed border-border-subtle rounded-2xl animate-tab-fade">
        <Activity size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-bold text-text-strong text-lg">Belum ada log pastoral</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-tab-fade pb-8">
      {logs.map((log, i) => (
        <div key={log.id_log || i} className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
              {log.kegiatan}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Calendar size={12} />
              {log.tgl ? format(new Date(log.tgl), 'dd MMM yyyy', { locale: dateFnsId }) : '-'}
            </span>
          </div>
          {log.catatan && <p className="text-sm text-text-strong mb-3 line-clamp-2">{log.catatan}</p>}
          <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
            {log.m_pos_pelkes?.nama_pos && <span>Lokasi: {log.m_pos_pelkes.nama_pos}</span>}
            {log.jml_jiwa != null && <span>Dilayani: {log.jml_jiwa} Jiwa</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
