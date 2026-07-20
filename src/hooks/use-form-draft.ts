'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to auto-save and restore form drafts in localStorage.
 * Format Key: draft:aset:{id_pos}:{kategori}:{id_aset || 'new'}
 */
export function useFormDraft<T extends Record<string, any>>(
  storageKey: string,
  initialValues: T
) {
  const [draft, setDraft] = useState<T>(initialValues);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Restore draft on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDraft(parsed.data);
        setLastSavedTime(parsed.time);
        setHasRestoredDraft(true);
      }
    } catch (e) {
      console.warn('Failed to restore draft from localStorage:', e);
    }
  }, [storageKey]);

  // Save draft to localStorage
  const saveDraft = useCallback(
    (data: Partial<T>) => {
      if (!storageKey) return;
      try {
        const payload = {
          data,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        setLastSavedTime(payload.time);
      } catch (e) {
        console.warn('Failed to save draft to localStorage:', e);
      }
    },
    [storageKey]
  );

  // Clear draft upon successful form submission
  const clearDraft = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
      setLastSavedTime(null);
      setHasRestoredDraft(false);
    } catch (e) {
      console.warn('Failed to clear draft from localStorage:', e);
    }
  }, [storageKey]);

  return {
    draft,
    saveDraft,
    clearDraft,
    hasRestoredDraft,
    lastSavedTime,
  };
}
