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

  // 1. Dapatkan auth user untuk Poka-Yoke Locking
  const { data: userAuth, isLoading: isLoadingAuth } = useUserMupelAuth();

  const isSuperadmin = !userAuth || userAuth.role === 'superadmin' || userAuth.role === 'sinode';
  const isMupelLocked = Boolean(userAuth?.id_mupel && !isSuperadmin);
  const isJemaatLocked = Boolean(
    userAuth?.id_induk &&
    ['admin_jemaat', 'kmj', 'pj_pos', 'pelayan', 'relawan'].includes(userAuth?.role || '')
  );

  // 2. Jika ada defaultIndukId, lakukan reverse lookup
  const { data: jemaatHierarchy, isLoading: isLookingUp } = useJemaatReverseLookup(defaultIndukId);

  // Effect: Poka-Yoke Auto-fill
  useEffect(() => {
    // Priority 1: Reverse Lookup Data (Edit Mode)
    if (jemaatHierarchy) {
      setSelectedMupel(jemaatHierarchy.id_mupel);
      if (value !== jemaatHierarchy.id_induk) {
        onChange(jemaatHierarchy.id_induk);
      }
    } 
    // Priority 2: Poka-Yoke Auto-fill dari Role User
    else if (userAuth) {
      if (userAuth.id_mupel && (!selectedMupel || isMupelLocked)) {
        setSelectedMupel(userAuth.id_mupel);
      }
      if (userAuth.id_induk && (!value || isJemaatLocked)) {
        if (value !== userAuth.id_induk) {
          onChange(userAuth.id_induk);
        }
      }
    }
  }, [jemaatHierarchy, userAuth, isMupelLocked, isJemaatLocked, value, onChange, selectedMupel]);

  // Handlers
  const handleMupelChange = (mupelId: string) => {
    if (isMupelLocked) return;
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
    <div className="space-y-1.5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <MupelSelect
          value={selectedMupel}
          onChange={handleMupelChange}
          disabled={disabled || isMupelLocked}
          required={true}
        />
        <JemaatSelect
          id_mupel={selectedMupel}
          value={value}
          onChange={onChange}
          disabled={disabled || isJemaatLocked}
          error={error}
          required={true}
        />
      </div>

      {(isMupelLocked || isJemaatLocked) && (
        <p className="text-[11px] text-brand-primary font-medium flex items-center gap-1.5">
          <span>🔒 Wilayah hierarki terisi otomatis & locked (Poka-Yoke RBAC)</span>
        </p>
      )}
    </div>
  );
}
