'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  saveFormDraft,
  getFormDraft,
  clearFormDraft,
  getDraftRelativeTime,
  cleanExpiredDrafts,
} from '@/lib/utils/draft-storage';

export function useFormDraft<T extends Record<string, any>>(
  storageKey: string,
  initialValues: T
) {
  const [draft, setDraft] = useState<T>(initialValues);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Restore draft on mount & clean expired drafts
  useEffect(() => {
    if (!storageKey) return;
    cleanExpiredDrafts();

    const existingDraft = getFormDraft<T>(storageKey);
    if (existingDraft) {
      setDraft(existingDraft.data as T);
      setLastSavedTimestamp(existingDraft.timestamp);
      setHasRestoredDraft(true);
      setStatus('saved');
    }
  }, [storageKey]);

  // Save draft to localStorage
  const saveDraft = useCallback(
    (data: Partial<T>) => {
      if (!storageKey) return;
      setStatus('saving');
      saveFormDraft(storageKey, data);
      const now = new Date().toISOString();
      setLastSavedTimestamp(now);
      setStatus('saved');
    },
    [storageKey]
  );

  // Clear draft upon successful form submission
  const clearDraft = useCallback(() => {
    if (!storageKey) return;
    clearFormDraft(storageKey);
    setLastSavedTimestamp(null);
    setHasRestoredDraft(false);
    setStatus('idle');
  }, [storageKey]);

  const relativeSavedTime = lastSavedTimestamp
    ? getDraftRelativeTime(lastSavedTimestamp)
    : null;

  return {
    draft,
    saveDraft,
    clearDraft,
    hasRestoredDraft,
    lastSavedTimestamp,
    relativeSavedTime,
    status,
  };
}
