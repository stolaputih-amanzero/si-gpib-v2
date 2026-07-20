import { JadwalItem } from '@/hooks/use-jadwal';
import { Calendar, MapPin, Edit2, Trash2 } from 'lucide-react';

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

  return (
    <div className="bg-surface-elevated rounded-xl p-4 border border-border-subtle shadow-soft space-y-3 hover:border-brand-primary/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex flex-col items-center justify-center font-bold shrink-0">
            <span className="text-[10px] uppercase font-bold">{item.hari.substring(0, 3)}</span>
            <span className="text-xs">{formatTime(item.jam)}</span>
          </div>
          <div>
            <h3 className="font-bold text-text-high text-base">{item.jenis}</h3>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1.5 mt-0.5">
              <Calendar size={13} />
              <span>
                Setiap Hari {item.hari}, Pukul {formatTime(item.jam)} WITA
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Edit Jadwal"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id_ibadah)}
            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Hapus Jadwal"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <span className="flex items-center gap-1 truncate max-w-[200px]">
          <MapPin size={13} className="shrink-0 text-brand-primary" />
          <span className="truncate">{item.pos?.nama_pos || item.id_pos}</span>
        </span>
        {item.keterangan && <span className="truncate italic max-w-[150px]">"{item.keterangan}"</span>}
      </div>
    </div>
  );
}
