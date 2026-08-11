'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { offlineStoreEngine } from '@/lib/offline/indexedDbStore';
import { adaptOfflineSyncToViewModel } from '@/adapters/offlineSyncViewModelAdapter';
import { OfflineSyncWorkspaceViewModel, OfflineCommandItemViewModel } from '@/types/offlineSyncViewModel.types';
import { OfflineSyncHeader } from './OfflineSyncHeader';
import { OfflineSyncSummaryCard } from './OfflineSyncSummaryCard';
import { OfflineQueuePanel } from './OfflineQueuePanel';
import { ConflictResolutionModal } from './ConflictResolutionModal';

export const OfflineSyncWorkspaceShell: React.FC = () => {
  const [vm, setVm] = useState<OfflineSyncWorkspaceViewModel | null>(null);
  const [selectedConflictItem, setSelectedConflictItem] = useState<OfflineCommandItemViewModel | null>(null);

  const reloadData = useCallback(async () => {
    const items = await offlineStoreEngine.getAllQueueItems();
    const conflicts = await offlineStoreEngine.getAllConflicts();
    const metadata = await offlineStoreEngine.getSyncMetadata();

    const adapted = adaptOfflineSyncToViewModel(items, conflicts, metadata);
    setVm(adapted);
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const handleDiscardItem = async (commandId: string) => {
    await offlineStoreEngine.removeQueueItem(commandId);
    await reloadData();
  };

  if (!vm) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-xs text-slate-400 font-mono">Memuat PWA Offline Transport Engine...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        <OfflineSyncHeader summary={vm.summary} onRefresh={reloadData} />
        <OfflineSyncSummaryCard summary={vm.summary} />
        <OfflineQueuePanel 
          items={vm.queueItems} 
          onInspectConflict={setSelectedConflictItem}
          onDiscardItem={handleDiscardItem}
        />
      </div>

      <ConflictResolutionModal 
        item={selectedConflictItem}
        onClose={() => setSelectedConflictItem(null)}
        onDiscard={handleDiscardItem}
      />
    </div>
  );
};
