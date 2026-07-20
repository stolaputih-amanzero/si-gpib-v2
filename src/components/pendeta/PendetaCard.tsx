import { PendetaItem } from '@/hooks/use-pendeta';
import { Phone, MapPin, Edit2, Trash2, ShieldCheck, Crown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PendetaCardProps {
  item: PendetaItem;
  onEdit: (item: PendetaItem) => void;
  onDelete: (id_pendeta: string) => void;
}

export function PendetaCard({ item, onEdit, onDelete }: PendetaCardProps) {
  const cleanPhone = item.no_wa ? item.no_wa.replace(/[^0-9]/g, '') : null;
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="bg-surface-elevated rounded-xl p-4 border border-border-subtle shadow-soft space-y-3 hover:border-brand-primary/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-serif font-bold text-lg shrink-0">
            {item.nama_lengkap.replace(/^(Pdt\.|Dkn\.|Pnt\.)\s*/i, '').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/pendeta/${item.id_pendeta}`}
                className="font-bold text-text-high text-base hover:text-brand-primary transition-colors"
              >
                {item.nama_lengkap}
              </Link>
              {item.is_kmj && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 flex items-center gap-1">
                  <Crown size={10} className="shrink-0 text-amber-600" />
                  <span>KMJ</span>
                </span>
              )}
              {item.is_pj && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck size={10} className="shrink-0 text-blue-600" />
                  <span>PJ</span>
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-brand-primary mt-0.5">{item.jabatan}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-2 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Edit Pendeta"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id_pendeta)}
            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Hapus Pendeta"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <span className="flex items-center gap-1 truncate max-w-[200px]">
          <MapPin size={13} className="shrink-0 text-brand-primary" />
          <span className="truncate">{item.jemaat_induk?.nama_induk || item.id_induk}</span>
        </span>

        <div className="flex items-center gap-3">
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

          <Link
            href={`/pendeta/${item.id_pendeta}`}
            className="flex items-center text-brand-primary font-semibold hover:underline"
          >
            <span>Detail</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
