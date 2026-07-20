import { JabatanStrukturalItem } from '@/hooks/use-jabatan-struktural';
import { Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface JabatanStrukturalCardProps {
  item: JabatanStrukturalItem;
  onEdit: (item: JabatanStrukturalItem) => void;
  onDelete: (id_jabatan: string) => void;
}

export function JabatanStrukturalCard({ item, onEdit, onDelete }: JabatanStrukturalCardProps) {
  const isAktif = item.status === 'Aktif';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isAktif 
        ? 'bg-surface-elevated border-brand-primary/30 shadow-soft' 
        : 'bg-surface-base border-border-subtle opacity-80'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
              isAktif 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-surface-sunken text-text-muted border-border-subtle'
            }`}>
              {item.status}
            </span>
            <span className="text-[10px] font-semibold text-brand-primary/80 bg-brand-primary/5 px-2 py-0.5 rounded-full">
              {item.kategori} ({item.tingkat})
            </span>
          </div>
          <h4 className="font-bold text-text-high text-base leading-snug">{item.nama_jabatan}</h4>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-surface-sunken rounded-lg transition-colors"
            title="Edit Jabatan"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id_jabatan)}
            className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
            title="Hapus Jabatan"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="shrink-0 opacity-70" />
          <span>
            {format(new Date(item.tgl_mulai), 'd MMM yyyy', { locale: id })} 
            {' '} - {' '}
            {item.tgl_selesai ? format(new Date(item.tgl_selesai), 'd MMM yyyy', { locale: id }) : 'Sekarang'}
          </span>
        </div>
        
        {item.no_sk && (
          <div className="flex items-start gap-2">
            <FileText size={13} className="shrink-0 opacity-70 mt-0.5" />
            <div>
              <span className="font-medium text-text-high">SK: {item.no_sk}</span>
              {item.tgl_sk && (
                <span className="block text-[11px] opacity-80">
                  Tgl SK: {format(new Date(item.tgl_sk), 'd MMM yyyy', { locale: id })}
                </span>
              )}
            </div>
          </div>
        )}

        {item.keterangan && (
          <div className="pt-2 mt-2 border-t border-border-subtle/50 text-[11px] italic">
            "{item.keterangan}"
          </div>
        )}
      </div>
    </div>
  );
}
