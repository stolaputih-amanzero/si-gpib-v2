'use client';

import { useState } from 'react';
import { RefreshCw, Inbox, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOfflineQueue } from '@/hooks/use-offline-queue';
import { syncManager } from '@/lib/offline/sync-manager';
import { haptic } from '@/lib/haptic/vibrate';

const OPERATION_LABEL: Record<string, string> = {
  rpc: 'RPC',
  insert: 'Tambah',
  update: 'Ubah',
};

export function OfflineQueuePanel() {
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { pendingSubmissions, deadLetters, pendingCount, dlqCount } = useOfflineQueue();

  const handleSyncNow = async () => {
    setSyncing(true);
    haptic('medium');
    await syncManager.processQueue();
    setSyncing(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* @ts-expect-error type missing asChild */}
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-[44px] relative bg-white/5 border-border-strong hover:bg-surface-sunken">
          <Inbox className="w-4 h-4 mr-2" />
          Antrean Offline
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-amber-500 text-amber-950 border-amber-600">{pendingCount}</Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Antrean Offline</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <Button onClick={handleSyncNow} disabled={syncing || pendingCount === 0} className="w-full min-h-[44px]">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Menyinkronkan...' : 'Sinkronisasi Sekarang'}
          </Button>

          {/* Pending submissions */}
          <section>
            <h3 className="text-sm font-semibold mb-3">Menunggu ({pendingCount})</h3>
            {pendingCount === 0 ? (
              <p className="text-sm text-text-muted">Tidak ada data tertunda.</p>
            ) : (
              <ul className="space-y-3">
                {pendingSubmissions.map((item) => (
                  <li key={item.id} className="p-3 bg-surface-sunken border border-border-subtle rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-high">{item.targetIdentifier}</span>
                      <Badge variant="secondary" className="text-[10px]">{OPERATION_LABEL[item.operationType] ?? item.operationType}</Badge>
                    </div>
                    <p className="text-[11px] text-text-muted mt-2">
                      Status: <span className="font-semibold">{item.status}</span> · Percobaan: {item.attempts}
                    </p>
                    {item.lastError && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{item.lastError}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Dead Letter Queue */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Gagal Permanen ({dlqCount})
            </h3>
            {dlqCount === 0 ? (
              <p className="text-sm text-text-muted">Tidak ada kegagalan.</p>
            ) : (
              <ul className="space-y-3">
                {deadLetters.map((dl) => (
                  <li key={dl.id} className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-900 dark:text-red-200">{dl.targetIdentifier}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-red-700 hover:text-red-800 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/50"
                        onClick={() => syncManager.retryDeadLetter(dl.id!)}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Coba lagi
                      </Button>
                    </div>
                    <p className="text-[11px] text-red-700 dark:text-red-300 mt-2">{dl.failureReason}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
