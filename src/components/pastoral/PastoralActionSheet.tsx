'use client';

import { BottomSheet } from '@/components/mobile/BottomSheet';
import { PastoralFormClient } from './PastoralFormClient';
import { usePosContext } from '@/stores/pos-context';

export interface PastoralActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PastoralActionSheet({ isOpen, onClose }: PastoralActionSheetProps) {
  const { activePosId } = usePosContext();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Catat Kunjungan Pastoral">
      <div className="mb-4">
        <div className="flex items-center gap-2 p-3 bg-surface-sunken rounded-xl border border-border-subtle">
          <span className="text-xs font-medium text-text-muted">Mencatat untuk:</span>
          <span className="text-sm font-bold text-brand-primary">Pos Pelkes Aktif</span>
        </div>
      </div>
      
      <PastoralFormClient 
        autoLockedPosId={activePosId} 
        onClose={onClose} 
        isSheetMode={true} 
      />
    </BottomSheet>
  );
}
