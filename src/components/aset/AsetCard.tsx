import { AsetGenericItem } from '@/types/aset.types';
import { getKategoriInfo } from '@/lib/constants/aset';
import { Calendar, MapPin, Paperclip, Edit2, Trash2, Eye, Share2 } from 'lucide-react';

interface AsetCardProps {
  item: AsetGenericItem;
  onSelect?: (item: AsetGenericItem) => void;
  onEdit?: (item: AsetGenericItem) => void;
  onDelete?: (id: string, kategori: 'TANAH' | 'BANGUNAN' | 'BERGERAK') => void;
  onShareWa?: (item: AsetGenericItem) => void;
}

export function AsetCard({ item, onSelect, onEdit, onDelete, onShareWa }: AsetCardProps) {
  const kategoriInfo = getKategoriInfo(item.kategori);

  return (
    <div 
      onClick={() => onSelect && onSelect(item)}
      className={`bg-surface-elevated rounded-xl p-4 border border-border-subtle shadow-soft space-y-3 hover:border-brand-primary/40 transition-all ${
        onSelect ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Photo Thumbnail or Category Icon */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-sunken shrink-0 border border-border-subtle flex items-center justify-center">
          {item.thumbnail_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.thumbnail_url} alt={item.judul} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{kategoriInfo?.icon || '📦'}</span>
          )}
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{
                backgroundColor: `${kategoriInfo?.warna || '#3B82F6'}1A`,
                color: kategoriInfo?.warna || '#3B82F6',
              }}
            >
              <span>{kategoriInfo?.icon}</span>
              <span>{kategoriInfo?.nama || item.kategori}</span>
            </span>
            {item.kondisi && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-sunken font-medium text-text-muted border border-border-subtle">
                {item.kondisi}
              </span>
            )}
          </div>

          <h3 className="font-bold text-text-high text-base truncate mt-1">{item.judul}</h3>
          <p className="text-xs text-text-muted truncate mt-0.5">{item.subjudul}</p>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs text-text-muted">
        <div className="flex items-center gap-3">
          {item.pos_nama &&
            !item.pos_nama.toLowerCase().startsWith('jemaat ') &&
            item.pos_nama !== item.jemaat_induk &&
            item.pos_nama !== 'Pelayanan Jemaat Direct' &&
            item.pos_nama !== '-' && (
              <span className="flex items-center gap-1 truncate max-w-[140px]" title={item.pos_nama}>
                <MapPin size={13} className="shrink-0 text-brand-primary" />
                <span className="truncate">{item.pos_nama}</span>
              </span>
            )}
          {item.tahun && (
            <span className="flex items-center gap-1">
              <Calendar size={13} className="shrink-0" />
              <span>{item.tahun}</span>
            </span>
          )}
          {item.lampiran_count > 0 && (
            <span className="flex items-center gap-1 font-medium text-brand-primary">
              <Paperclip size={13} />
              <span>{item.lampiran_count}</span>
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onShareWa && (
            <button
              type="button"
              onClick={() => onShareWa(item)}
              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Bagikan ke WhatsApp"
            >
              <Share2 size={16} />
            </button>
          )}
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Lihat Detail Aset"
            >
              <Eye size={16} />
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Edit Aset"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id, item.kategori)}
              className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Hapus Aset"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
