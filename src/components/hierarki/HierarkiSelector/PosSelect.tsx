'use client';

import { usePosByInduk } from '@/hooks/use-hierarki-selector';
import { SearchableSelect, SelectOption } from './SearchableSelect';

interface PosSelectProps {
  id_induk: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function PosSelect({ id_induk, value, onChange, disabled, error }: PosSelectProps) {
  const { data: posList, isLoading } = usePosByInduk(id_induk);

  const options: SelectOption[] =
    posList?.map((p) => ({
      value: p.id_pos,
      label: p.nama_pos,
      sublabel: `ID: ${p.id_pos}`,
    })) || [];

  return (
    <SearchableSelect
      label="Pos Pelkes / Bajem *"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="-- Pilih Pos Pelkes --"
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
