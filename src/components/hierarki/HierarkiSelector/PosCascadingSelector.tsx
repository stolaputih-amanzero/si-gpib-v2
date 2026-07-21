'use client';

import { useState, useEffect } from 'react';
import { MupelSelect } from './MupelSelect';
import { JemaatSelect } from './JemaatSelect';
import { PosSelect } from './PosSelect';
import { useUserMupelAuth, usePosReverseLookup } from '@/hooks/use-hierarki-selector';

interface PosCascadingSelectorProps {
  value?: string | null;
  onChange: (value: string) => void;
  onJemaatChange?: (id_induk: string) => void;
  error?: string;
  jemaatError?: string;
  disabled?: boolean;
  defaultPosId?: string; // Untuk mode Edit
  required?: boolean; // Controls whether Pos Pelkes is required (Mupel & Jemaat are always compulsory)
}

export function PosCascadingSelector({
  value,
  onChange,
  onJemaatChange,
  error,
  jemaatError,
  disabled,
  defaultPosId,
  required = true,
}: PosCascadingSelectorProps) {
  const [selectedMupel, setSelectedMupel] = useState<string>('');
  const [selectedJemaat, setSelectedJemaat] = useState<string>('');

  // 1. Dapatkan auth user & role untuk Poka-Yoke Auto-Selection & Locking
  const { data: userAuth, isLoading: isLoadingAuth } = useUserMupelAuth();

  // Poka-Yoke Lock Rules per Role
  const isSuperadmin = !userAuth || userAuth.role === 'superadmin' || userAuth.role === 'sinode';
  const isMupelLocked = Boolean(userAuth?.id_mupel && !isSuperadmin);
  const isJemaatLocked = Boolean(
    userAuth?.id_induk &&
    ['admin_jemaat', 'kmj', 'pj_pos', 'pelayan', 'relawan'].includes(userAuth?.role || '')
  );
  const isPosLocked = Boolean(
    userAuth?.id_pos &&
    ['pj_pos', 'pelayan', 'relawan'].includes(userAuth?.role || '')
  );

  // 2. Jika ada defaultPosId (Edit Mode), lakukan reverse lookup
  const { data: posHierarchy, isLoading: isLookingUp } = usePosReverseLookup(defaultPosId);

  // Effect: Poka-Yoke Auto-fill & Locking Synchronization
  useEffect(() => {
    // Priority 1: Reverse Lookup Data (Edit Mode)
    if (posHierarchy) {
      const mupelId = posHierarchy.jemaat_induk?.id_mupel || '';
      const jemaatId = posHierarchy.id_induk || '';
      setSelectedMupel(mupelId);
      setSelectedJemaat(jemaatId);
      if (onJemaatChange && jemaatId) {
        onJemaatChange(jemaatId);
      }
      if (value !== posHierarchy.id_pos) {
        onChange(posHierarchy.id_pos);
      }
    } 
    // Priority 2: Poka-Yoke Auto-fill berdasarkan Role & Penugasan User
    else if (userAuth) {
      if (userAuth.id_mupel && (!selectedMupel || isMupelLocked)) {
        setSelectedMupel(userAuth.id_mupel);
      }
      if (userAuth.id_induk && (!selectedJemaat || isJemaatLocked)) {
        setSelectedJemaat(userAuth.id_induk);
        if (onJemaatChange) onJemaatChange(userAuth.id_induk);
      }
      if (userAuth.id_pos && (!value || isPosLocked)) {
        if (value !== userAuth.id_pos) {
          onChange(userAuth.id_pos);
        }
      }
    }
  }, [
    posHierarchy,
    userAuth,
    isMupelLocked,
    isJemaatLocked,
    isPosLocked,
    value,
    onChange,
    onJemaatChange,
    selectedMupel,
    selectedJemaat,
  ]);

  // Handlers
  const handleMupelChange = (mupelId: string) => {
    if (isMupelLocked) return;
    setSelectedMupel(mupelId);
    setSelectedJemaat(''); // Reset Jemaat
    if (onJemaatChange) onJemaatChange('');
    onChange(''); // Reset Pos
  };

  const handleJemaatChange = (jemaatId: string) => {
    if (isJemaatLocked) return;
    setSelectedJemaat(jemaatId);
    if (onJemaatChange) onJemaatChange(jemaatId);
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
    <div className="space-y-1.5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
        <MupelSelect
          value={selectedMupel}
          onChange={handleMupelChange}
          disabled={disabled || isMupelLocked}
          required={true}
        />
        <JemaatSelect
          id_mupel={selectedMupel}
          value={selectedJemaat}
          onChange={handleJemaatChange}
          disabled={disabled || isJemaatLocked}
          error={jemaatError}
          required={true}
        />
        <PosSelect
          id_induk={selectedJemaat}
          value={value || ''}
          onChange={onChange}
          disabled={disabled || isPosLocked}
          error={error}
          required={required}
        />
      </div>

      {/* Poka-Yoke System Notice if locked */}
      {(isMupelLocked || isJemaatLocked || isPosLocked) && (
        <p className="text-[11px] text-brand-primary font-medium flex items-center gap-1.5">
          <span>🔒 Wilayah hierarki terisi otomatis & locked (Poka-Yoke RBAC)</span>
        </p>
      )}
    </div>
  );
}
