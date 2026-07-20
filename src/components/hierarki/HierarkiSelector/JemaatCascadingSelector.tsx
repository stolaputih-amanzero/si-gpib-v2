'use client';

import { useState, useEffect } from 'react';
import { MupelSelect } from './MupelSelect';
import { JemaatSelect } from './JemaatSelect';
import { useUserMupelAuth, useJemaatReverseLookup } from '@/hooks/use-hierarki-selector';

interface JemaatCascadingSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  defaultIndukId?: string; // Untuk mode Edit
}

export function JemaatCascadingSelector({
  value,
  onChange,
  error,
  disabled,
  defaultIndukId,
}: JemaatCascadingSelectorProps) {
  const [selectedMupel, setSelectedMupel] = useState<string>('');

  // 1. Dapatkan auth user untuk lock Mupel
  const { data: userAuth, isLoading: isLoadingAuth } = useUserMupelAuth();
  const isMupelLocked = userAuth?.role === 'admin_mupel';
  const defaultAuthMupel = userAuth?.id_mupel;

  // 2. Jika ada defaultIndukId, lakukan reverse lookup
  const { data: jemaatHierarchy, isLoading: isLookingUp } = useJemaatReverseLookup(defaultIndukId);

  // Effect: Sinkronisasi init value
  useEffect(() => {
    // Priority 1: Reverse Lookup Data
    if (jemaatHierarchy) {
      setSelectedMupel(jemaatHierarchy.id_mupel);
      // Panggil onChange jika belum sinkron dengan value
      if (value !== jemaatHierarchy.id_induk) {
        onChange(jemaatHierarchy.id_induk);
      }
    } 
    // Priority 2: Lock Mupel for Admin
    else if (isMupelLocked && defaultAuthMupel && !selectedMupel) {
      setSelectedMupel(defaultAuthMupel);
    }
  }, [jemaatHierarchy, isMupelLocked, defaultAuthMupel, value, onChange, selectedMupel]);

  // Handlers
  const handleMupelChange = (mupelId: string) => {
    setSelectedMupel(mupelId);
    onChange(''); // Reset child
  };

  if (isLookingUp || isLoadingAuth) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
        <div className="h-[44px] bg-surface-sunken rounded-xl w-full"></div>
        <div className="h-[44px] bg-surface-sunken rounded-xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      <MupelSelect
        value={selectedMupel}
        onChange={handleMupelChange}
        disabled={disabled || isMupelLocked}
      />
      <JemaatSelect
        id_mupel={selectedMupel}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
      />
    </div>
  );
}
