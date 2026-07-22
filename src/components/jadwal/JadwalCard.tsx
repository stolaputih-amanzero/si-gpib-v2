import { JadwalItem } from '@/hooks/use-jadwal';
import { Clock, Landmark } from 'lucide-react';

interface JadwalCardProps {
  item: JadwalItem;
  onClickCard: (item: JadwalItem) => void;
}

export function JadwalCard({ item, onClickCard }: JadwalCardProps) {
  // Format HH:mm
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const isJemaatScope = item.pos?.nama_pos?.startsWith('Jemaat ');
  const displayName = isJemaatScope
    ? item.pos?.nama_pos.substring(7)
    : item.pos?.nama_pos || item.id_pos;

  return (
    <div 
      onClick={() => onClickCard(item)}
      className="bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-medium hover:border-brand-primary/30 transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
    >
      <div className="flex-1 min-w-0">
        {/* Content Block */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-text-high text-sm sm:text-base leading-snug group-hover:text-brand-primary transition-colors truncate">
              {item.jenis}
            </h3>
            {isJemaatScope && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40">
                ⛪ Jemaat
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            <span className="flex items-center gap-1.5 shrink-0">
              <Clock size={13} className="text-brand-primary" />
              <span>Hari {item.hari}, Jam {formatTime(item.jam)} {item.zona_waktu || 'WIB'}</span>
            </span>
            <span className="flex items-center gap-1.5 truncate">
              <Landmark size={13} className="text-brand-primary shrink-0" />
              <span className="truncate">
                {item.pos?.jemaat_induk?.nama_induk || 'Jemaat Induk'}
                {!isJemaatScope && ` - ${displayName}`}
              </span>
            </span>
          </div>

          {item.keterangan && (
            <p className="text-xs text-text-muted italic bg-surface-sunken/40 px-3 py-1.5 rounded-lg border border-border-subtle/50 whitespace-pre-wrap leading-relaxed inline-block mt-1">
              "{item.keterangan}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
