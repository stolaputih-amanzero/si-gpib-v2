import { PelayanItem } from '@/hooks/use-pelayan';
import { Phone, MapPin, Edit2, Trash2 } from 'lucide-react';

interface PelayanCardProps {
  item: PelayanItem;
  onEdit: (item: PelayanItem) => void;
  onDelete: (id_pelayan: string) => void;
}

export function PelayanCard({ item, onEdit, onDelete }: PelayanCardProps) {
  const cleanPhone = item.no_wa ? item.no_wa.replace(/[^0-9]/g, '') : null;
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="bg-surface-elevated rounded-xl p-4 border border-border-subtle shadow-soft space-y-3 hover:border-brand-primary/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg shrink-0">
            {item.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-text-high text-base">{item.nama}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  item.status === 'Aktif'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-brand-primary mt-0.5">{item.jabatan}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Edit Pelayan"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id_pelayan)}
            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Hapus Pelayan"
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
