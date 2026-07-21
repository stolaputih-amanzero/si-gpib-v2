'use client';

import { useState, useEffect } from 'react';
import { MupelSelect } from './MupelSelect';
import { JemaatSelect } from './JemaatSelect';
import { PosSelect } from './PosSelect';
import {
  useUserMupelAuth,
  usePosReverseLookup,
  useMupelOptions,
  useJemaatOptions,
  usePosOptions,
} from '@/hooks/use-hierarki-selector';

export interface HierarchyMetaInfo {
  id_mupel: string;
  id_induk: string;
  id_pos?: string;
  mupelName?: string;
  jemaatName?: string;
  posName?: string;
}

interface PosCascadingSelectorProps {
  value?: string | null;
  onChange: (value: string) => void;
  onJemaatChange?: (id_induk: string) => void;
  onMetaChange?: (meta: HierarchyMetaInfo) => void;
  error?: string;
  jemaatError?: string;
  disabled?: boolean;
  defaultPosId?: string; // Untuk mode Edit
  required?: boolean; // Controls whether Pos Pelkes is required (Mupel & Jemaat are always compulsory)
  hidePos?: boolean; // Poka-Yoke: Hides Pos Pelkes dropdown if target is Jemaat Induk level
}

export function PosCascadingSelector({
  value,
  onChange,
  onJemaatChange,
  onMetaChange,
  error,
  jemaatError,
  disabled,
  defaultPosId,
  required = true,
  hidePos = false,
}: PosCascadingSelectorProps) {
  const [selectedMupel, setSelectedMupel] = useState<string>('');
  const [selectedJemaat, setSelectedJemaat] = useState<string>('');

  // 1. Dapatkan auth user & role untuk Poka-Yoke Auto-Selection & Locking
  const { data: userAuth } = useUserMupelAuth();

  // Fetch option lists to get human readable names
  const { data: mupelList } = useMupelOptions();
  const { data: jemaatList } = useJemaatOptions(selectedMupel);
  const { data: posList } = usePosOptions(selectedJemaat);

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

  // Effect: Send meta hierarchy info (Names) to parent form
  useEffect(() => {
    if (onMetaChange) {
      const mupelObj = mupelList?.find((m) => m.id === selectedMupel);
      const jemaatObj = jemaatList?.find((j) => j.id === selectedJemaat);
      const posObj = posList?.find((p) => p.id === value);

      onMetaChange({
        id_mupel: selectedMupel,
        id_induk: selectedJemaat,
        id_pos: value || undefined,
        mupelName: mupelObj?.nama || posHierarchy?.jemaat_induk?.mupel?.nama_mupel,
        jemaatName: jemaatObj?.nama || posHierarchy?.jemaat_induk?.nama_induk,
        posName: posObj?.nama || posHierarchy?.nama_pos,
      });
    }
  }, [selectedMupel, selectedJemaat, value, mupelList, jemaatList, posList, posHierarchy, onMetaChange]);

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

  if (defaultPosId && isLookingUp) {
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
      <div className={`grid grid-cols-1 ${hidePos ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3 w-full`}>
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
        {!hidePos && (
          <PosSelect
            id_induk={selectedJemaat}
            value={value || ''}
            onChange={onChange}
            disabled={disabled || isPosLocked}
            error={error}
            required={required}
          />
        )}
      </div>

      {/* Poka-Yoke System Notice if locked */}
      {(isMupelLocked || isJemaatLocked || (isPosLocked && !hidePos)) && (
        <p className="text-[11px] text-brand-primary font-medium flex items-center gap-1.5">
          <span>🔒 Wilayah hierarki terisi otomatis & locked (Poka-Yoke RBAC)</span>
        </p>
      )}
    </div>
  );
}
