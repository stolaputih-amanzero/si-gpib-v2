'use client';

import { useState, useEffect } from 'react';
import { MupelSelect } from './MupelSelect';
import { JemaatSelect } from './JemaatSelect';
import { PosSelect } from './PosSelect';
import { useUserMupelAuth, usePosReverseLookup } from '@/hooks/use-hierarki-selector';

interface PosCascadingSelectorProps {
  value?: string | null;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  defaultPosId?: string; // Untuk mode Edit
  required?: boolean;
}

export function PosCascadingSelector({
  value,
  onChange,
  error,
  disabled,
  defaultPosId,
  required = true,
}: PosCascadingSelectorProps) {
  const [selectedMupel, setSelectedMupel] = useState<string>('');
  const [selectedJemaat, setSelectedJemaat] = useState<string>('');

  // 1. Dapatkan auth user untuk lock Mupel
  const { data: userAuth, isLoading: isLoadingAuth } = useUserMupelAuth();
  const isMupelLocked = userAuth?.role === 'admin_mupel';
  const defaultAuthMupel = userAuth?.id_mupel;

  // 2. Jika ada defaultPosId, lakukan reverse lookup
  const { data: posHierarchy, isLoading: isLookingUp } = usePosReverseLookup(defaultPosId);

  // Effect: Sinkronisasi init value
  useEffect(() => {
    // Priority 1: Reverse Lookup Data
    if (posHierarchy) {
      setSelectedMupel(posHierarchy.jemaat_induk?.id_mupel || '');
      setSelectedJemaat(posHierarchy.id_induk || '');
      // Panggil onChange jika belum sinkron dengan value
      if (value !== posHierarchy.id_pos) {
        onChange(posHierarchy.id_pos);
      }
    } 
    // Priority 2: Lock Mupel for Admin
    else if (isMupelLocked && defaultAuthMupel && !selectedMupel) {
      setSelectedMupel(defaultAuthMupel);
    }
  }, [posHierarchy, isMupelLocked, defaultAuthMupel, value, onChange, selectedMupel]);

  // Handlers
  const handleMupelChange = (mupelId: string) => {
    setSelectedMupel(mupelId);
    setSelectedJemaat(''); // Reset Jemaat
    onChange(''); // Reset Pos
  };

  const handleJemaatChange = (jemaatId: string) => {
    setSelectedJemaat(jemaatId);
    onChange(''); // Reset Pos
  };

  if (isLookingUp || isLoadingAuth) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-pulse">
        <div className="h-[44px] bg-surface-sunken rounded-xl w-full"></div>
        <div className="h-[44px] bg-surface-sunken rounded-xl w-full"></div>
        <div className="h-[44px] bg-surface-sunken rounded-xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      <MupelSelect
        value={selectedMupel}
        onChange={handleMupelChange}
        disabled={disabled || isMupelLocked}
        required={required}
      />
      <JemaatSelect
        id_mupel={selectedMupel}
        value={selectedJemaat}
        onChange={handleJemaatChange}
        disabled={disabled}
        required={required}
      />
      <PosSelect
        id_induk={selectedJemaat}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        error={error}
        required={required}
      />
    </div>
  );
}
