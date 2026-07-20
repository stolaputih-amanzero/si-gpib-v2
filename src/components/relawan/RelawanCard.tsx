import { RelawanItem } from '@/hooks/use-relawan';
import { Phone, MapPin, Award, Edit2, Trash2 } from 'lucide-react';

interface RelawanCardProps {
  item: RelawanItem;
  onEdit: (item: RelawanItem) => void;
  onDelete: (id_relawan: string) => void;
}

export function RelawanCard({ item, onEdit, onDelete }: RelawanCardProps) {
  const cleanPhone = item.no_wa ? item.no_wa.replace(/[^0-9]/g, '') : null;
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="bg-surface-elevated rounded-xl p-4 border border-border-subtle shadow-soft space-y-3 hover:border-brand-primary/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-lg shrink-0">
            {item.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-text-high text-base">{item.nama}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                {item.kategori}
              </span>
            </div>
            {item.pelatihan ? (
              <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                <Award size={13} className="text-amber-500 shrink-0" />
                <span className="truncate max-w-[200px]">{item.pelatihan}</span>
              </p>
            ) : (
              <p className="text-xs text-text-muted mt-0.5">{item.gender}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Edit Relawan"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id_relawan)}
            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Hapus Relawan"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <span className="flex items-center gap-1 truncate max-w-[180px]">
          <MapPin size={13} className="shrink-0 text-brand-primary" />
          <span className="truncate">{item.pos?.nama_pos || item.id_pos}</span>
        </span>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-600 font-medium hover:underline"
          >
            <Phone size={13} />
            <span>{item.no_wa}</span>
          </a>
        )}
      </div>
    </div>
  );
}
