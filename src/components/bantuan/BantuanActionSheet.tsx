'use client';

import { BottomSheet } from '@/components/mobile/BottomSheet';
import { BantuanFormClient } from './BantuanFormClient';
import { useActiveContext } from '@/stores/active-context';

export interface BantuanActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BantuanActionSheet({ isOpen, onClose }: BantuanActionSheetProps) {
  const { activeContextId } = useActiveContext();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Pengajuan Bantuan">
      <div className="mb-4">
        <div className="flex items-center gap-2 p-3 bg-surface-sunken rounded-xl border border-border-subtle">
          <span className="text-xs font-medium text-text-muted">Mengajukan untuk:</span>
          <span className="text-sm font-bold text-brand-primary">Pos Pelkes Aktif</span>
        </div>
      </div>
      
      {/* 
        We pass autoLockedPosId to force the form to use it.
        We also pass onClose so the form can close the sheet on success.
      */}
      <BantuanFormClient 
        autoLockedPosId={activeContextId} 
        onClose={onClose} 
        isSheetMode={true} 
      />
    </BottomSheet>
  );
}
