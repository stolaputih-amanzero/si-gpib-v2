import { AsetGenericItem } from '@/types/aset.types';
import { getKategoriInfo } from '@/lib/constants/aset';
import { Calendar, MapPin, Paperclip } from 'lucide-react';

interface AsetCardProps {
  item: AsetGenericItem;
  onSelect?: (item: AsetGenericItem) => void;
}

export function AsetCard({ item, onSelect }: AsetCardProps) {
  const kategoriInfo = getKategoriInfo(item.kategori);

  const displayPosNama =
    item.pos_nama &&
    !item.pos_nama.toLowerCase().startsWith('jemaat ') &&
    item.pos_nama !== item.jemaat_induk &&
    item.pos_nama !== 'Pelayanan Jemaat Direct' &&
    item.pos_nama !== '-'
      ? item.pos_nama
      : null;

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
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
              style={{
                backgroundColor: `${kategoriInfo?.warna || '#3B82F6'}1A`,
                color: kategoriInfo?.warna || '#3B82F6',
              }}
            >
              <span>{kategoriInfo?.icon}</span>
              <span>{kategoriInfo?.nama || item.kategori}</span>
            </span>

            {displayPosNama && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20 truncate max-w-[140px]" title={displayPosNama}>
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{displayPosNama}</span>
              </span>
            )}

            {item.kondisi && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-sunken font-medium text-text-muted border border-border-subtle shrink-0">
                {item.kondisi}
              </span>
            )}
          </div>

          <h3 className="font-bold text-text-high text-base truncate mt-1.5">{item.judul}</h3>
          <p className="text-xs text-text-muted truncate mt-0.5">{item.subjudul}</p>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle text-xs text-text-muted">
        <div className="flex items-center gap-3 shrink-0">
          {item.tahun && (
            <span className="flex items-center gap-1 font-medium">
              <Calendar size={13} className="shrink-0 text-text-muted" />
              <span>{item.tahun}</span>
            </span>
          )}
          {item.lampiran_count > 0 && (
            <span className="flex items-center gap-1 font-semibold text-brand-primary">
              <Paperclip size={13} />
              <span>{item.lampiran_count} Dokumen/Foto</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
