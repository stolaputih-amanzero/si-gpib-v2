'use client';

import { BottomSheet } from '@/components/mobile/BottomSheet';
import { AssetFormClient } from './AssetFormClient';
import { useActiveContext } from '@/stores/active-context';

export interface AsetActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AsetActionSheet({ isOpen, onClose }: AsetActionSheetProps) {
  const { activeContextId } = useActiveContext();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Foto / Input Aset">
      <div className="mb-4">
        <div className="flex items-center gap-2 p-3 bg-surface-sunken rounded-xl border border-border-subtle">
          <span className="text-xs font-medium text-text-muted">Mencatat untuk:</span>
          <span className="text-sm font-bold text-brand-primary">Pos Pelkes Aktif</span>
        </div>
      </div>
      
      <AssetFormClient 
        autoLockedPosId={activeContextId} 
        onClose={onClose} 
        isSheetMode={true} 
      />
    </BottomSheet>
  );
}
