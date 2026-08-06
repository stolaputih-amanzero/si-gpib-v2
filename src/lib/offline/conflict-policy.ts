import { db, type PendingSubmission, type DeadLetter } from './dexie';
import { SyncTracker } from '@/lib/telemetry/sync-tracker';
import { logger } from '@/lib/utils/logger';

export type ConflictPolicy = 'lww' | 'reject' | 'optimistic_check';

export function getConflictPolicy(targetIdentifier: string): ConflictPolicy {
  // Policy per domain
  const policies: Record<string, ConflictPolicy> = {
    // Draft/Catatan — LWW (aman, append-only)
    't_log_pastoral': 'lww',
    't_log_aktivitas': 'lww',
    
    // Pengajuan Bantuan — Reject (melibatkan approval workflow)
    't_pengajuan_bantuan': 'reject',
    't_approval_bantuan': 'reject',
    
    // Aset — Optimistic Check (inventaris bernilai)
    't_aset_tanah': 'optimistic_check',
    't_aset_bangunan': 'optimistic_check',
    't_aset_bergerak': 'optimistic_check',
    
    // Master Data — Optimistic Check (hierarkis)
    'm_pos_pelkes': 'optimistic_check',
    'm_jemaat_induk': 'optimistic_check',
    'm_pendeta': 'optimistic_check',
    
    // Demografi — LWW (data statistik, tidak kritis)
    't_demografi_pelkat': 'lww',
  };

  return policies[targetIdentifier] || 'optimistic_check';
}

function getPrimaryKeyColumn(targetIdentifier: string): string {
  // Simplifikasi: kembalikan kolom primary key. Bisa dimapping jika perlu.
  if (targetIdentifier === 'm_pendeta') return 'id_pendeta';
  if (targetIdentifier === 'm_pos_pelkes') return 'id_pos';
  if (targetIdentifier === 'm_jemaat_induk') return 'id_induk';
  return 'id';
}

function getRecordId(payload: Record<string, unknown>): string | undefined {
  return (payload.id as string) || (payload.id_pendeta as string) || (payload.id_pos as string) || (payload.id_induk as string);
}

export async function moveToDLQ(item: PendingSubmission, error: Error) {
  const deadLetter: DeadLetter = {
    requestId: item.requestId,
    operationType: item.operationType,
    targetIdentifier: item.targetIdentifier,
    payload: item.payload,
    failureReason: error.message,
    httpStatus: (error as any).status,
    errorCode: (error as any).code,
    attempts: item.attempts,
    createdAt: item.createdAt,
    movedToDLQAt: Date.now(),
  };

  await db.deadLetters.add(deadLetter);
  await db.pendingSubmissions.delete(item.id!);
  
  SyncTracker.trackDLQMoved(item.requestId, item.targetIdentifier, error.message);
  logger.error(`[SyncEngine] Moved to DLQ: ${item.requestId}`, error);
}

export async function resolveConflict(
  item: PendingSubmission,
  supabase: any
): Promise<'success' | 'conflict' | 'reject'> {
  const policy = getConflictPolicy(item.targetIdentifier);

  switch (policy) {
    case 'lww':
      // Langsung execute, tidak perlu check
      return 'success';

    case 'reject':
      // Tidak boleh sync offline, harus online manual
      await moveToDLQ(item, new Error('REJECT_POLICY: Must be submitted online'));
      return 'reject';

    case 'optimistic_check':
      // Check updated_at di server
      // Asumsi ada expectedUpdatedAt di payload untuk optimistic check
      const expectedUpdatedAt = item.payload.updated_at as string | undefined;
      
      if (!expectedUpdatedAt) {
        // Jika tidak ada expectedUpdatedAt, kita tidak bisa melakukan optimistic check, kembalikan conflict untuk direview manual
        // Atau jika ini operasi insert (biasanya tidak ada id), anggap success (LWW) 
        if (item.operationType === 'insert') return 'success';
        return 'conflict';
      }
      
      const recordId = getRecordId(item.payload);
      if (!recordId) return 'conflict';
      
      const { data: current } = await supabase
        .from(item.targetIdentifier)
        .select('updated_at')
        .eq(getPrimaryKeyColumn(item.targetIdentifier), recordId)
        .single();

      if (current && new Date(current.updated_at) > new Date(expectedUpdatedAt)) {
        SyncTracker.trackConflictDetected(item.targetIdentifier, recordId, item.requestId);
        return 'conflict';
      }
      return 'success';
  }
}
