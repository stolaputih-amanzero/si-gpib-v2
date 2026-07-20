'use client';

import { useMupelList } from '@/hooks/use-hierarki';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface MupelSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function MupelSelect({ value, onChange, disabled, error }: MupelSelectProps) {
  const { data: mupelList, isLoading } = useMupelList();

  const options: SelectOption[] =
    mupelList?.map((m) => ({
      value: m.id_mupel,
      label: `Mupel ${m.nama_mupel}`,
      sublabel: `ID: ${m.id_mupel}`,
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
