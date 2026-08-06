'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type PendingSubmission } from '@/lib/offline/dexie';
import { processPendingQueue } from '@/lib/offline/sync-manager';
import { useState } from 'react';
import { RefreshCw, Trash2, Database, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/utils/logger';

export default function QueueInspectorPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const pendingSubmissions = useLiveQuery(() => db.pendingSubmissions.orderBy('createdAt').reverse().toArray());
  const pendingAttachments = useLiveQuery(() => db.pendingAttachments.orderBy('createdAt').reverse().toArray());

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await processPendingQueue();
      // Assume attachments will also have their own sync process later
    } catch (error) {
      logger.error('Force sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearFailed = async () => {
    if (!confirm('Hapus semua antrean yang gagal?')) return;
    const failedIds = pendingSubmissions
      ?.filter((s: PendingSubmission) => s.status === 'failed')
      .map((s: PendingSubmission) => s.id!);
      
    if (failedIds && failedIds.length > 0) {
      await db.pendingSubmissions.bulkDelete(failedIds);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus item ini dari antrean?')) {
      await db.pendingSubmissions.delete(id);
    }
  };
  
  const handleRetry = async (id: number) => {
    await db.pendingSubmissions.update(id, { status: 'pending', attempts: 0, lastError: undefined });
    handleForceSync();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Database className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'syncing': return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Syncing</Badge>;
      case 'failed': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'done': return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Done</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offline Queue Inspector</h1>
          <p className="text-muted-foreground mt-1">Pantau dan kelola antrean data lokal (IndexedDB) sebelum disinkronisasikan ke server.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearFailed} disabled={!pendingSubmissions?.some((s: PendingSubmission) => s.status === 'failed')}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Failed
          </Button>
          <Button onClick={handleForceSync} disabled={isSyncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Force Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending (Data)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions?.filter((s: PendingSubmission) => s.status === 'pending').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingSubmissions?.filter((s: PendingSubmission) => s.status === 'failed').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attachments Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAttachments?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Queue</CardTitle>
          <CardDescription>Antrean transaksi (Insert/Update/RPC)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Operation</th>
                  <th className="p-3 font-medium">Target</th>
                  <th className="p-3 font-medium">Created At</th>
                  <th className="p-3 font-medium">Attempts</th>
                  <th className="p-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!pendingSubmissions || pendingSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Antrean kosong. Semua data tersinkronisasi.
                    </td>
                  </tr>
                ) : (
                  pendingSubmissions.map((item: PendingSubmission) => (
                    <tr key={item.id} className="hover:bg-muted/25 transition-colors">
                      <td className="p-3 align-top">
                        {getStatusBadge(item.status)}
                        {item.lastError && (
                          <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={item.lastError}>
                            {item.lastError}
                          </div>
                        )}
                      </td>
                      <td className="p-3 align-top font-mono text-xs uppercase">{item.operationType}</td>
                      <td className="p-3 align-top">{item.targetIdentifier}</td>
                      <td className="p-3 align-top text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                        <div className="mt-1 font-mono text-[10px] opacity-50">Req: {item.requestId?.split('-')[0]}...</div>
                      </td>
                      <td className="p-3 align-top">{item.attempts}x</td>
                      <td className="p-3 align-top text-right">
                        <div className="flex justify-end gap-1">
                          {item.status === 'failed' && (
                            <Button variant="ghost" size="icon" onClick={() => handleRetry(item.id!)} title="Retry">
                              <Play className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id!)} title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
