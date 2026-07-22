import { JadwalItem } from '@/hooks/use-jadwal';
import { Edit2, Trash2, Clock, Landmark } from 'lucide-react';

interface JadwalCardProps {
  item: JadwalItem;
  onEdit: (item: JadwalItem) => void;
  onDelete: (id_ibadah: string) => void;
}

export function JadwalCard({ item, onEdit, onDelete }: JadwalCardProps) {
  // Format HH:mm
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const isJemaatScope = item.pos?.nama_pos?.startsWith('Jemaat ');
  const displayName = isJemaatScope
    ? item.pos?.nama_pos.substring(7) // strip out "Jemaat "
    : item.pos?.nama_pos || item.id_pos;

  return (
    <div className="bg-surface-elevated rounded-2xl p-4 border border-border-subtle shadow-soft hover:shadow-medium hover:border-brand-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Date Badge */}
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex flex-col items-center justify-center font-bold shrink-0 border border-brand-primary/10">
          <span className="text-[10px] uppercase font-black tracking-wider">{item.hari.substring(0, 3)}</span>
          <span className="text-xs font-extrabold">{formatTime(item.jam)}</span>
        </div>

        {/* Content Block */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-text-high text-sm sm:text-base leading-snug truncate">
              {item.jenis}
            </h3>
            {isJemaatScope ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40">
                ⛪ Jemaat
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40">
                📍 Pos Pelkes
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

          {/* Keterangan */}
          {item.keterangan && (
            <p className="text-xs text-text-muted italic bg-surface-sunken/40 px-3 py-1.5 rounded-lg border border-border-subtle/50 whitespace-pre-wrap leading-relaxed inline-block mt-1">
              "{item.keterangan}"
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col items-center gap-1 border-t sm:border-t-0 sm:border-l border-border-subtle pt-2 sm:pt-0 sm:pl-3 shrink-0 justify-end">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-all active:scale-90 min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Edit Jadwal"
        >
          <Edit2 size={15} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id_ibadah)}
          className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-90 min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Hapus Jadwal"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
