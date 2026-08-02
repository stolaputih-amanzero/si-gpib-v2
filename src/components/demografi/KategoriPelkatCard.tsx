'use client';

import { useState } from 'react';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { InfoBlock } from '@/components/detail/InfoBlock';
import { cn } from '@/lib/utils';

export interface KategoriPelkatCardProps {
  pelkat: {
    kode: string;
    nama: string;
    icon: string;
    deskripsi: string;
  };
  record?: any | null;
  onEdit?: (record: any) => void;
  onDelete?: (kategori_pelkat: string) => void;
  onAddNew?: (kode: string) => void;
  className?: string;
}

export function KategoriPelkatCard({
  pelkat,
  record,
  onEdit,
  onDelete,
  onAddNew,
  className,
}: KategoriPelkatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalJiwa = record ? (record.laki || 0) + (record.perempuan || 0) : 0;

  return (
    <div
      className={cn(
        'bg-surface-1 rounded-2xl border transition-all overflow-hidden',
        record
          ? 'border-border-subtle shadow-2xs hover:border-brand-primary/40'
          : 'border-dashed border-border-subtle opacity-75',
        className
      )}
    >
      {/* Collapsed Header Bar */}
      <div
        onClick={() => record && setIsExpanded(!isExpanded)}
        className={cn(
          'p-4 flex items-center justify-between transition-colors min-h-[56px]',
          record ? 'cursor-pointer hover:bg-surface-sunken/40' : ''
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-2xl shrink-0">{pelkat.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-text-high text-sm truncate">{pelkat.nama}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-sunken text-text-tertiary font-bold">
                {pelkat.kode}
              </span>
            </div>
            <p className="text-[11px] text-text-tertiary truncate">{pelkat.deskripsi}</p>
          </div>
        </div>

        {record ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs font-black text-brand-primary block tabular-nums">{totalJiwa} Jiwa</span>
              <span className="text-[10px] text-text-tertiary font-medium">{record.jml_kk || 0} KK</span>
            </div>
            <ChevronDown
              size={18}
              className={cn('text-text-tertiary transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddNew && onAddNew(pelkat.kode)}
            className="px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary text-xs font-extrabold transition-all shrink-0 cursor-pointer min-h-[44px]"
          >
            + Isi Data
          </button>
        )}
      </div>

      {/* Expanded Detail Panel */}
      {record && isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border-subtle bg-surface-sunken/30 space-y-4 animate-fade-in">
          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-surface-1 border border-border-subtle">
              <span className="text-[10px] text-text-tertiary font-bold uppercase block">Jumlah KK</span>
              <span className="font-black text-text-high text-sm tabular-nums">{record.jml_kk || 0}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600">
              <span className="text-[10px] font-bold uppercase block">Laki-Laki</span>
              <span className="font-black text-sm tabular-nums">{record.laki || 0}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-600">
              <span className="text-[10px] font-bold uppercase block">Perempuan</span>
              <span className="font-black text-sm tabular-nums">{record.perempuan || 0}</span>
            </div>
          </div>

          {/* Detailed InfoBlocks */}
          <div className="space-y-3">
            <InfoBlock label="Mata Pencaharian / Profesi Dominan" value={record.profesi || 'Belum diisi'} />
            <InfoBlock label="Tingkat Pendidikan Dominan" value={record.pendidikan || 'Belum diisi'} />
            {record.keterangan && <InfoBlock label="Keterangan Catatan" value={record.keterangan} />}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle/50">
            <button
              type="button"
              onClick={() => onEdit && onEdit(record)}
              className="px-3 py-2 rounded-xl bg-surface-1 hover:bg-surface-sunken border border-border-subtle text-text-high text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Edit2 size={14} className="text-brand-primary" />
              <span>Edit Data</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete && onDelete(record.kategori_pelkat)}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Trash2 size={14} />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KategoriPelkatCard;
