'use client';

import { usePosOptions } from '@/hooks/use-hierarki-selector';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface PosSelectProps {
  id_induk: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export function PosSelect({ id_induk, value, onChange, disabled, error, required = true }: PosSelectProps) {
  const { data: posOptions, isLoading } = usePosOptions(id_induk);

  const options: SelectOption[] =
    posOptions?.map((p) => ({
      value: p.id,
      label: p.nama,
      sublabel: p.kategori ? `${p.kategori} (ID: ${p.id})` : `ID: ${p.id}`,
    })) || [];

  return (
    <SearchableSelect
      label={required ? "Pos Pelkes / Bajem *" : "Pos Pelkes / Bajem (Opsional)"}
      value={value}
      onChange={onChange}
      options={options}
      placeholder="-- Pilih Pos Pelkes (Opsional) --"
      searchPlaceholder="Cari Pos Pelkes / Bajem..."
      disabled={disabled || !id_induk}
      disabledMessage={!id_induk ? '-- Pilih Jemaat Dahulu --' : undefined}
      isLoading={isLoading && !!id_induk}
      loadingText="Memuat Pos Pelkes..."
      error={error}
      emptyMessage={!id_induk ? 'Pilih Jemaat terlebih dahulu' : 'Pos Pelkes tidak ditemukan'}
    />
  );
}
