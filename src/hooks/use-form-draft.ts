'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/offline/dexie';
import { logger } from '@/lib/utils/logger';
import { useToast } from '@/components/ui/toast';

export function useFormDraft<T extends Record<string, any>>(
  storageKey: string,
  initialValues: T
) {
  const [draft, setDraft] = useState<T>(initialValues);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { toast } = useToast();

  // Load draft dari Dexie saat mount
  useEffect(() => {
    if (!storageKey) return;
    
    const loadDraft = async () => {
      try {
        setIsLoading(true);
        const stored = await db.drafts.get(storageKey);
        
        if (stored) {
          setDraft(stored.data as T);
          setLastSavedTimestamp(new Date(stored.timestamp).toISOString());
          setHasRestoredDraft(true);
          setStatus('saved');
          logger.info(`[Draft] Loaded draft for ${storageKey}`, { timestamp: stored.timestamp });
        }
      } catch (error) {
        logger.error(`[Draft] Failed to load draft for ${storageKey}`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDraft();
    
    // Check storage quota on mount
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        if (estimate.usage && estimate.quota) {
          const usageRatio = estimate.usage / estimate.quota;
          if (usageRatio > 0.8) {
            toast.error('Penyimpanan Penuh', 'Penyimpanan perangkat Anda hampir penuh. Draf mungkin gagal disimpan.');
          }
        }
      }).catch((e) => logger.warn('[Draft] Failed to estimate storage', e));
    }
  }, [storageKey, toast]);

  // Save draft ke Dexie (async)
  const saveDraft = useCallback(
    async (data: Partial<T>) => {
      if (!storageKey) return;
      setStatus('saving');
      const now = Date.now();
      
      try {
        await db.drafts.put({
          formKey: storageKey,
          data,
          timestamp: now,
        });
        setLastSavedTimestamp(new Date(now).toISOString());
        setStatus('saved');
      } catch (error: any) {
        if (error.name === 'QuotaExceededError') {
          logger.error('[Draft] Storage quota exceeded!');
          toast.error('Penyimpanan Penuh', 'Tidak dapat menyimpan draf karena penyimpanan penuh.');
          setStatus('idle');
        } else {
          logger.error(`[Draft] Failed to save draft for ${storageKey}`, error);
          setStatus('idle');
        }
      }
    },
    [storageKey, toast]
  );

  // Clear draft dari Dexie
  const clearDraft = useCallback(async () => {
    if (!storageKey) return;
    try {
      await db.drafts.delete(storageKey);
      setLastSavedTimestamp(null);
      setHasRestoredDraft(false);
      setStatus('idle');
      logger.info(`[Draft] Cleared draft for ${storageKey}`);
    } catch (error) {
      logger.error(`[Draft] Failed to clear draft for ${storageKey}`, error);
    }
  }, [storageKey]);

  return {
    draft,
    isLoading,
    saveDraft,
    clearDraft,
    hasRestoredDraft,
    lastSavedTimestamp,
    relativeSavedTime: lastSavedTimestamp,
    status,
  };
}
