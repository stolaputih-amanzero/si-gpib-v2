'use client';

import { useJemaatOptions } from '@/hooks/use-hierarki-selector';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface JemaatSelectProps {
  id_mupel: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function JemaatSelect({ id_mupel, value, onChange, disabled, error }: JemaatSelectProps) {
  const { data: jemaatOptions, isLoading } = useJemaatOptions(id_mupel);

  const options: SelectOption[] =
    jemaatOptions?.map((j) => ({
      value: j.id,
      label: j.nama,
      sublabel: `ID: ${j.id}`,
    })) || [];

  return (
    <SearchableSelect
      label="Jemaat Induk *"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="-- Pilih Jemaat Induk --"
      searchPlaceholder="Cari Jemaat Induk..."
      disabled={disabled || !id_mupel}
      disabledMessage={!id_mupel ? '-- Pilih Mupel Dahulu --' : undefined}
      isLoading={isLoading && !!id_mupel}
      loadingText="Memuat Jemaat..."
      error={error}
      emptyMessage={!id_mupel ? 'Pilih Mupel terlebih dahulu' : 'Jemaat tidak ditemukan'}
    />
  );
}
