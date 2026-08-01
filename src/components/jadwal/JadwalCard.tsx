import { JadwalItem } from '@/hooks/use-jadwal';
import { Clock, Landmark, Calendar, ChevronRight } from 'lucide-react';

interface JadwalCardProps {
  item: JadwalItem;
  onClickCard: (item: JadwalItem) => void;
}

export function JadwalCard({ item, onClickCard }: JadwalCardProps) {
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const isJemaatScope = item.pos?.nama_pos?.startsWith('Jemaat ');
  const displayName = isJemaatScope
    ? item.pos?.nama_pos.substring(7)
    : item.pos?.nama_pos || item.id_pos;

  const lokasiStr = `${item.pos?.jemaat_induk?.nama_induk || 'Jemaat Induk'}${!isJemaatScope && displayName ? ` - ${displayName}` : ''}`;

  return (
    <div 
      onClick={() => onClickCard(item)}
      className="p-3.5 sm:p-4 hover:bg-surface-hover/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group min-h-[52px]"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary shrink-0">
          <Calendar className="w-5 h-5" />
        </span>

        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-text-high text-sm sm:text-base leading-snug group-hover:text-brand-primary transition-colors truncate">
              {item.jenis}
            </h3>
            {isJemaatScope && (
              <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/40">
                ⛪ Jemaat
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1 shrink-0 font-medium">
              <Clock size={13} className="text-brand-primary" />
              <span>Hari {item.hari}, Jam {formatTime(item.jam)} {item.zona_waktu || 'WIB'}</span>
            </span>
            <span className="hidden sm:inline text-text-muted/40">•</span>
            <span className="inline-flex items-center gap-1 truncate font-medium">
              <Landmark size={13} className="text-brand-primary shrink-0" />
              <span className="truncate">{lokasiStr}</span>
            </span>
          </div>

          {item.keterangan && (
            <p className="text-xs text-text-muted italic truncate mt-0.5">
              "{item.keterangan}"
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center shrink-0 text-text-muted group-hover:text-brand-primary transition-colors">
        <ChevronRight size={18} />
      </div>
    </div>
  );
}
