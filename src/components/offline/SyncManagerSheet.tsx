'use client';

import { useState } from 'react';
import { RefreshCw, Inbox, AlertTriangle, CloudUpload, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSyncManager } from '@/hooks/use-sync-manager';

const CONTRACT_LABEL: Record<string, string> = {
  'OC-PASTORAL-001': 'Log Pastoral',
  'OC-ASET-001': 'Aset',
  'OC-BANTUAN-001': 'Bantuan',
};

export function SyncManagerSheet() {
  const [open, setOpen] = useState(false);
  const { queuedItems, pendingCount, failedCount, syncing, processQueue, discardItem, retryItem } = useSyncManager();

  const totalCount = pendingCount + failedCount;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="min-h-[40px] px-2.5 sm:px-3 relative bg-surface-elevated hover:bg-surface-sunken border-border-subtle text-text-high rounded-xl shrink-0" />
        }
      >
        <Inbox className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Antrean Offline</span>
        {totalCount > 0 && (
          <Badge className={`ml-1 sm:ml-2 ${failedCount > 0 ? 'bg-red-500 text-red-950 border-red-600' : 'bg-amber-500 text-amber-950 border-amber-600'}`}>
            {totalCount}
          </Badge>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manajer Sinkronisasi</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <Button onClick={processQueue} disabled={syncing || pendingCount === 0} className="w-full min-h-[44px]">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Menyinkronkan...' : 'Coba Sinkron Ulang'}
          </Button>

          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              Daftar Antrean
              {failedCount > 0 && <span className="ml-2 text-red-500 text-xs">({failedCount} Gagal)</span>}
            </h3>
            {queuedItems.length === 0 ? (
              <p className="text-sm text-text-muted">Tidak ada data tertunda.</p>
            ) : (
              <ul className="space-y-3">
                {queuedItems.map((item) => (
                  <li key={item.id} className={`p-3 bg-surface-sunken border rounded-xl ${item.status === 'FAILED' ? 'border-red-500/50 bg-red-500/5' : 'border-border-subtle'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-high">{CONTRACT_LABEL[item.contractId] ?? item.contractId}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {item.status === 'PENDING' && <RefreshCw className="w-3 h-3 mr-1 inline animate-spin" />}
                        {item.status === 'SYNCING' && <CloudUpload className="w-3 h-3 mr-1 inline animate-bounce" />}
                        {item.status === 'FAILED' && <XCircle className="w-3 h-3 mr-1 inline text-red-500" />}
                        {item.status}
                      </Badge>
                    </div>
                    
                    {item.status === 'FAILED' && (
                      <div className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 rounded">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {item.error_detail || 'Ditolak oleh server'}
                      </div>
                    )}
                    
                    <div className="mt-3 flex gap-2 justify-end">
                      {item.status === 'FAILED' && (
                        <Button variant="outline" size="sm" onClick={() => retryItem(item.id!)} className="text-xs h-8">
                          Coba Lagi
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => discardItem(item.id!)} className="text-xs h-8">
                        Buang Data Ini
                      </Button>
                    </div>
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
