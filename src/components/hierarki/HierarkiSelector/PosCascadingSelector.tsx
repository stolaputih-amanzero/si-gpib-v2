'use client';

import { useState, useEffect, useRef } from 'react';
import { MupelSelect } from './MupelSelect';
import { JemaatSelect } from './JemaatSelect';
import { PosSelect } from './PosSelect';
import {
  useUserMupelAuth,
  usePosReverseLookup,
  useJemaatReverseLookup,
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
  defaultJemaatId?: string; // Fallback jika id_pos null
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
  defaultJemaatId,
  required = true,
  hidePos = false,
}: PosCascadingSelectorProps) {
  const [selectedMupel, setSelectedMupel] = useState<string>('');
  const [selectedJemaat, setSelectedJemaat] = useState<string>('');

  // Refs for callbacks to prevent infinite re-render loops from inline prop functions
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onJemaatChangeRef = useRef(onJemaatChange);
  onJemaatChangeRef.current = onJemaatChange;

  const onMetaChangeRef = useRef(onMetaChange);
  onMetaChangeRef.current = onMetaChange;

  const lastSentMetaRef = useRef<string>('');

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

  // 2. Jika ada defaultPosId atau defaultJemaatId (Edit Mode), lakukan reverse lookup
  const { data: posHierarchy, isLoading: isLookingUpPos } = usePosReverseLookup(defaultPosId);
  const { data: jemaatHierarchy, isLoading: isLookingUpJemaat } = useJemaatReverseLookup(
    !defaultPosId ? defaultJemaatId : undefined
  );

  const isLookingUp = (defaultPosId && isLookingUpPos) || (defaultJemaatId && !defaultPosId && isLookingUpJemaat);

  // Effect: Poka-Yoke Auto-fill & Locking Synchronization
  useEffect(() => {
    // Priority 1: Reverse Lookup Pos Data (Edit Mode)
    if (posHierarchy) {
      const mupelId = posHierarchy.jemaat_induk?.id_mupel || '';
      const jemaatId = posHierarchy.id_induk || '';
      if (mupelId && selectedMupel !== mupelId) {
        setSelectedMupel(mupelId);
      }
      if (jemaatId && selectedJemaat !== jemaatId) {
        setSelectedJemaat(jemaatId);
        if (onJemaatChangeRef.current) {
          onJemaatChangeRef.current(jemaatId);
        }
      }
      if (posHierarchy.id_pos && value !== posHierarchy.id_pos) {
        onChangeRef.current(posHierarchy.id_pos);
      }
    } 
    // Priority 2: Reverse Lookup Jemaat Data if id_pos is null
    else if (jemaatHierarchy) {
      const mupelId = jemaatHierarchy.id_mupel || '';
      const jemaatId = jemaatHierarchy.id_induk || '';
      if (mupelId && selectedMupel !== mupelId) {
        setSelectedMupel(mupelId);
      }
      if (jemaatId && selectedJemaat !== jemaatId) {
        setSelectedJemaat(jemaatId);
        if (onJemaatChangeRef.current) {
          onJemaatChangeRef.current(jemaatId);
        }
      }
    }
    // Priority 3: Poka-Yoke Auto-fill berdasarkan Role & Penugasan User
    else if (userAuth) {
      if (userAuth.id_mupel && (!selectedMupel || isMupelLocked)) {
        if (selectedMupel !== userAuth.id_mupel) {
          setSelectedMupel(userAuth.id_mupel);
        }
      }
      if (userAuth.id_induk && (!selectedJemaat || isJemaatLocked)) {
        if (selectedJemaat !== userAuth.id_induk) {
          setSelectedJemaat(userAuth.id_induk);
          if (onJemaatChangeRef.current) onJemaatChangeRef.current(userAuth.id_induk);
        }
      }
      if (userAuth.id_pos && (!value || isPosLocked)) {
        if (value !== userAuth.id_pos) {
          onChangeRef.current(userAuth.id_pos);
        }
      }
    }
  }, [
    posHierarchy,
    jemaatHierarchy,
    userAuth,
    isMupelLocked,
    isJemaatLocked,
    isPosLocked,
    value,
    selectedMupel,
    selectedJemaat,
  ]);

  // Effect: Send meta hierarchy info (Names) to parent form
  useEffect(() => {
    if (onMetaChangeRef.current) {
      const mupelObj = mupelList?.find((m) => m.id === selectedMupel);
      const jemaatObj = jemaatList?.find((j) => j.id === selectedJemaat);
      const posObj = posList?.find((p) => p.id === value);

      const meta: HierarchyMetaInfo = {
        id_mupel: selectedMupel,
        id_induk: selectedJemaat,
        id_pos: value || undefined,
        mupelName: mupelObj?.nama || posHierarchy?.jemaat_induk?.mupel?.nama_mupel,
        jemaatName: jemaatObj?.nama || posHierarchy?.jemaat_induk?.nama_induk,
        posName: posObj?.nama || posHierarchy?.nama_pos,
      };

      const metaKey = JSON.stringify(meta);
      if (lastSentMetaRef.current !== metaKey) {
        lastSentMetaRef.current = metaKey;
        onMetaChangeRef.current(meta);
      }
    }
  }, [selectedMupel, selectedJemaat, value, mupelList, jemaatList, posList, posHierarchy]);

  // Auto-select first pos when hidePos is true (Jemaat Induk scope)
  useEffect(() => {
    if (hidePos && selectedJemaat && posList && posList.length > 0) {
      if (!value || !posList.some((p) => p.id === value)) {
        if (value !== posList[0].id) {
          onChangeRef.current(posList[0].id);
        }
      }
    }
  }, [hidePos, selectedJemaat, posList, value]);

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
