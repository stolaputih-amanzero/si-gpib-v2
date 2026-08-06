import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

function getNetworkType(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const conn = (navigator as any).connection;
  if (!conn) return 'unknown';
  return conn.effectiveType || 'unknown';
}

export const SyncTracker = {
  trackSyncStart: (queueLength: number) => {
    logger.info(`[SyncTracker] Sync started with ${queueLength} items`);
    Sentry.addBreadcrumb({
      category: 'sync',
      message: `Sync started with ${queueLength} items`,
      level: 'info',
    });
  },
  
  trackSyncComplete: async (duration: number, successCount: number, failCount: number = 0) => {
    // 1. Sentry (error tracking)
    if (duration > 5000 || failCount > 0) {
      Sentry.captureMessage(`Sync: ${duration}ms, ${failCount} failures`, {
        level: failCount > 0 ? 'error' : 'warning',
        tags: { sync_engine: 'true' },
        contexts: { sync: { duration, successCount, failCount } as any },
      });
    }

    // 2. Supabase (agregat untuk dashboard)
    try {
      const supabase = createClient();
      await supabase.from('sys_telemetry').insert({
        event_type: 'sync_complete',
        duration_ms: Math.round(duration),
        success_count: successCount,
        fail_count: failCount,
        network_type: getNetworkType(),
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.warn('[Telemetry] Failed to write to Supabase', { error: err.message || err });
    }
  },
  
  trackSyncError: (error: any, requestId: string, targetIdentifier: string) => {
    logger.error(`[SyncTracker] Sync error for ${targetIdentifier} (Req: ${requestId})`, error);
    Sentry.captureException(error, {
      tags: {
        syncTarget: targetIdentifier,
        syncRequestId: requestId,
        isSyncError: 'true'
      }
    });
  },

  trackQueueLength: (count: number) => {
    if (count > 0) {
      Sentry.setTag('offlineQueueLength', count);
    }
  },

  trackConflictDetected: async (tableName: string, recordId: string, requestId: string) => {
    // Sentry
    Sentry.captureMessage(`Sync conflict: ${tableName}/${recordId}`, {
      level: 'warning',
      tags: { sync_engine: 'true', conflict: 'true' },
    });

    // Supabase
    try {
      const supabase = createClient();
      await supabase.from('sys_telemetry').insert({
        event_type: 'conflict_detected',
        metadata: { tableName, recordId, requestId } as any,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.warn('[Telemetry] Failed to write conflict to Supabase', { error: err.message || err });
    }
  },

  trackDLQMoved: async (requestId: string, targetIdentifier: string, failureReason: string) => {
    try {
      const supabase = createClient();
      await supabase.from('sys_telemetry').insert({
        event_type: 'dlq_moved',
        metadata: { requestId, targetIdentifier, failureReason } as any,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.warn('[Telemetry] Failed to write DLQ event', { error: err.message || err });
    }
  }
};
