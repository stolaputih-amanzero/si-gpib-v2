'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  saveFormDraft, 
  getFormDraft, 
  clearFormDraft, 
  getDraftRelativeTime,
  cleanExpiredDrafts 
} from '@/lib/utils/draft-storage';

/**
 * Enhanced hook to auto-save and restore form drafts in localStorage.
 * Discards drafts older than 7 days and formats relative time using date-fns.
 */
export function useFormDraft<T extends Record<string, any>>(
  storageKey: string,
  initialValues: T
) {
  const [draft, setDraft] = useState<T>(initialValues);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);

  // Restore draft on mount & clean expired drafts
  useEffect(() => {
    if (!storageKey) return;
    cleanExpiredDrafts();

    const existingDraft = getFormDraft<T>(storageKey);
    if (existingDraft) {
      setDraft(existingDraft.data as T);
      setLastSavedTimestamp(existingDraft.timestamp);
      setHasRestoredDraft(true);
    }
  }, [storageKey]);

  // Save draft to localStorage
  const saveDraft = useCallback(
    (data: Partial<T>) => {
      if (!storageKey) return;
      saveFormDraft(storageKey, data);
      setLastSavedTimestamp(new Date().toISOString());
    },
    [storageKey]
  );

  // Clear draft upon successful form submission
  const clearDraft = useCallback(() => {
    if (!storageKey) return;
    clearFormDraft(storageKey);
    setLastSavedTimestamp(null);
    setHasRestoredDraft(false);
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
  };
}
