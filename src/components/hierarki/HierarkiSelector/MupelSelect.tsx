'use client';

import { useMupelOptions } from '@/hooks/use-hierarki-selector';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface MupelSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function MupelSelect({ value, onChange, disabled, error }: MupelSelectProps) {
  const { data: mupelOptions, isLoading } = useMupelOptions();

  const options: SelectOption[] =
    mupelOptions?.map((m) => ({
      value: m.id,
      label: `Mupel ${m.nama}`,
      sublabel: `ID: ${m.id}`,
    })) || [];

  return (
    <SearchableSelect
      label="Mupel *"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="-- Pilih Mupel --"
      searchPlaceholder="Cari Mupel..."
      disabled={disabled}
      isLoading={isLoading}
      loadingText="Memuat Mupel..."
      error={error}
      emptyMessage="Mupel tidak ditemukan"
    />
  );
}
