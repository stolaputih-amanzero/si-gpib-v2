'use client';

import { ReactNode } from 'react';
import { FormField } from '@/components/forms/FormField';
import { DemografiKategoriInput } from '@/lib/validations/demografi.schema';
import { cn } from '@/lib/utils';

export interface DemografiKategoriSectionProps {
  kategori: string;
  label: string;
  icon: string | ReactNode;
  deskripsi?: string;
  data: DemografiKategoriInput;
  onChange: (field: keyof DemografiKategoriInput, value: any) => void;
  className?: string;
}

export function DemografiKategoriSection({
  kategori,
  label,
  icon,
  deskripsi,
  data,
  onChange,
  className,
}: DemografiKategoriSectionProps) {
  const isPkp = kategori === 'PKP';
  const isPkb = kategori === 'PKB';

  return (
    <section
      id={`section-${kategori}`}
      role="tabpanel"
      aria-labelledby={`tab-${kategori}`}
      className={cn(
        'p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xs space-y-4 scroll-mt-28',
        className
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">{typeof icon === 'string' ? icon : icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-text-high text-base">{label}</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-sunken text-brand-primary font-bold">
                {kategori}
              </span>
            </div>
            {deskripsi && <p className="text-xs text-text-tertiary">{deskripsi}</p>}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-brand-primary block tabular-nums">
            {(data.laki || 0) + (data.perempuan || 0)} Jiwa
          </span>
          <span className="text-[10px] text-text-tertiary font-medium">{data.jml_kk || 0} KK</span>
        </div>
      </div>

      {/* 3 Numeric FormFields Grid (Jumlah KK, Laki-Laki, Perempuan) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField label="Jumlah KK" required>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={9999}
            value={data.jml_kk || ''}
            onChange={(e) => onChange('jml_kk', parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high font-bold text-sm focus:ring-2 focus:ring-brand-primary"
          />
        </FormField>

        <FormField label="Laki-Laki" required>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={9999}
            disabled={isPkp}
            value={isPkp ? 0 : data.laki || ''}
            onChange={(e) => onChange('laki', parseInt(e.target.value, 10) || 0)}
            placeholder={isPkp ? '-' : '0'}
            className={cn(
              'w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle text-sm font-bold focus:ring-2 focus:ring-blue-500',
              isPkp
                ? 'bg-surface-sunken opacity-60 cursor-not-allowed text-text-tertiary'
                : 'bg-surface-1 text-blue-600 font-extrabold'
            )}
          />
        </FormField>

        <FormField label="Perempuan" required>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={9999}
            disabled={isPkb}
            value={isPkb ? 0 : data.perempuan || ''}
            onChange={(e) => onChange('perempuan', parseInt(e.target.value, 10) || 0)}
            placeholder={isPkb ? '-' : '0'}
            className={cn(
              'w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle text-sm font-bold focus:ring-2 focus:ring-pink-500',
              isPkb
                ? 'bg-surface-sunken opacity-60 cursor-not-allowed text-text-tertiary'
                : 'bg-surface-1 text-pink-600 font-extrabold'
            )}
          />
        </FormField>
      </div>

      {/* 2 Text Fields (Profesi & Pendidikan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Profesi Dominan (Opsional)">
          <input
            type="text"
            value={data.profesi || ''}
            onChange={(e) => onChange('profesi', e.target.value)}
            placeholder="Contoh: Petani, Pedagang, PNS"
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-xs focus:ring-2 focus:ring-brand-primary"
          />
        </FormField>

        <FormField label="Pendidikan Dominan (Opsional)">
          <input
            type="text"
            value={data.pendidikan || ''}
            onChange={(e) => onChange('pendidikan', e.target.value)}
            placeholder="Contoh: SMA, SMP, SD"
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-xs focus:ring-2 focus:ring-brand-primary"
          />
        </FormField>
      </div>

      {/* Textarea Field (Keterangan Opsional) */}
      <FormField label="Keterangan Catatan (Opsional)">
        <textarea
          rows={2}
          value={data.keterangan || ''}
          onChange={(e) => onChange('keterangan', e.target.value)}
          placeholder="Catatan tambahan kondisi demografi kategori ini..."
          className="w-full min-h-[80px] px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-1 text-text-high text-xs focus:ring-2 focus:ring-brand-primary resize-none"
        />
      </FormField>
    </section>
  );
}

export default DemografiKategoriSection;
