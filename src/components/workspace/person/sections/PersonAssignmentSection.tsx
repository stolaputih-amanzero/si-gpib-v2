import { UnifiedPersonData } from '@/lib/services/person';
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { id as dateFnsId } from 'date-fns/locale';
import Link from 'next/link';

export function PersonAssignmentSection({ personData }: { personData: UnifiedPersonData }) {
  const penugasan = personData.penugasan || [];

  if (penugasan.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-1 border border-border-dashed border-border-subtle rounded-2xl animate-tab-fade">
        <MapPin size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
        <h3 className="font-bold text-text-strong text-lg">Belum ada penugasan</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-tab-fade pb-8">
      {penugasan.map((p, i) => {
        const isActive = p.status_tugas?.toLowerCase() === 'aktif';
        return (
          <Link 
            key={p.id_tugas || i} 
            href={`/org/${encodeURIComponent(p.id_pos)}`}
            className="block bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs hover:bg-surface-sunken transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-text-strong text-sm">
                {p.m_pos_pelkes?.nama_pos || p.id_pos}
              </h4>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-surface-sunken border-border-subtle text-text-muted'}`}>
                {p.status_tugas || 'Aktif'}
              </span>
            </div>
            
            <p className="text-xs text-brand-primary mb-3 font-medium">
              Induk: {p.m_pos_pelkes?.jemaat_induk || '-'}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>{format(new Date(p.tgl_mulai), 'MMM yyyy', { locale: dateFnsId })}</span>
              <span>—</span>
              <span>{p.tgl_selesai ? format(new Date(p.tgl_selesai), 'MMM yyyy', { locale: dateFnsId }) : 'Sekarang'}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
