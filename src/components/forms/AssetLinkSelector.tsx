'use client';

import { useAsetList } from '@/hooks/use-aset';
import { Box, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AssetLinkValue {
  id_tanah?: string | null;
  id_bangunan?: string | null;
  id_aset_b?: string | null;
}

export interface AssetLinkSelectorProps {
  idPos?: string | null;
  value?: AssetLinkValue;
  onChange: (val: AssetLinkValue) => void;
  className?: string;
}

export function AssetLinkSelector({
  idPos,
  value,
  onChange,
  className,
}: AssetLinkSelectorProps) {
  const { data: asetList, isLoading } = useAsetList({ id_pos: idPos || undefined });

  const getSelectedId = () => {
    if (!value) return '';
    return value.id_tanah || value.id_bangunan || value.id_aset_b || '';
  };

  const handleSelectChange = (id: string) => {
    if (!id) {
      onChange({ id_tanah: null, id_bangunan: null, id_aset_b: null });
      return;
    }

    const selected = asetList?.find((a) => a.id === id);
    if (selected) {
      if (selected.kategori === 'TANAH') {
        onChange({ id_tanah: selected.id, id_bangunan: null, id_aset_b: null });
      } else if (selected.kategori === 'BANGUNAN') {
        onChange({ id_tanah: null, id_bangunan: selected.id, id_aset_b: null });
      } else if (selected.kategori === 'BERGERAK') {
        onChange({ id_tanah: null, id_bangunan: null, id_aset_b: selected.id });
      }
    }
  };

  if (!idPos) {
    return (
      <div className="p-3 rounded-xl bg-surface-sunken border border-border-subtle text-xs text-text-tertiary italic">
        Pilih Wilayah Pos Pelkes terlebih dahulu untuk melihat daftar aset terkait.
      </div>
    );
  }

  return (
    <div className={cn('space-y-2 w-full', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-high flex items-center gap-1.5">
          <Box size={15} className="text-brand-primary" />
          <span>Kaitkan dengan Aset Pos (Opsional)</span>
        </label>
        {isLoading && <Loader2 size={14} className="animate-spin text-brand-primary" />}
      </div>

      <select
        value={getSelectedId()}
        onChange={(e) => handleSelectChange(e.target.value)}
        disabled={isLoading}
        className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-xs font-bold focus:ring-2 focus:ring-brand-primary cursor-pointer"
      >
        <option value="">-- Tanpa Link Aset (Pengajuan Umum) --</option>
        {asetList && asetList.length > 0 ? (
          asetList.map((item) => (
            <option key={item.id} value={item.id}>
              [{item.kategori}] {item.judul} {item.kondisi ? `(${item.kondisi})` : ''}
            </option>
          ))
        ) : (
          <option value="" disabled>
            Tidak ada data aset terdaftar di pos ini
          </option>
        )}
      </select>
    </div>
  );
}

export default AssetLinkSelector;
