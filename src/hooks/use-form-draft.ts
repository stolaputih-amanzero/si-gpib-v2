import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/offline/dexie';

export const FORM_KEYS = {
  ASET_NEW: 'aset-new',
} as const;

export function useFormDraft(formKey: string, formOrInitialData: any, intervalMs: number = 30000) {
  const isHookForm = formOrInitialData && typeof formOrInitialData.watch === 'function';
  
  const [isRestored, setIsRestored] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [draft, setDraft] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  
  const currentValuesRef = useRef<any>(isHookForm ? formOrInitialData.getValues() : formOrInitialData);
  
  // New API: auto-watch
  useEffect(() => {
    if (!isHookForm) return;
    const subscription = formOrInitialData.watch((value: any) => {
      currentValuesRef.current = value;
    });
    return () => subscription.unsubscribe();
  }, [isHookForm, formOrInitialData]);

  // Clean old drafts on mount
  useEffect(() => {
    const cleanupOldDrafts = async () => {
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const cutoff = Date.now() - THIRTY_DAYS;
      await db.drafts.where('timestamp').below(cutoff).delete();
    };
    cleanupOldDrafts().catch(console.error);
  }, []);

  // Restore draft on mount
  useEffect(() => {
    let isMounted = true;
    const restoreDraft = async () => {
      try {
        const draftData = await db.drafts.get(formKey);
        if (draftData && isMounted) {
          setDraft(draftData.data);
          setLastSaved(draftData.timestamp);
          if (isHookForm) {
            formOrInitialData.reset(draftData.data, { keepDefaultValues: true });
          }
        }
      } catch (err) {
        console.error('Failed to restore draft', err);
      } finally {
        if (isMounted) setIsRestored(true);
      }
    };
    restoreDraft();
    return () => { isMounted = false; };
  }, [formKey, isHookForm, formOrInitialData]);

  // Save function (can be called manually in legacy mode)
  const saveDraft = useCallback(async (dataToSave?: any) => {
    if (!isRestored) return;
    const data = dataToSave || currentValuesRef.current;
    if (!data) return;
    
    setStatus('saving');
    try {
      await db.drafts.put({
        formKey,
        data,
        timestamp: Date.now(),
      });
      setStatus('saved');
      setLastSaved(Date.now());
    } catch (err) {
      console.error('Failed to save draft', err);
      setStatus('idle');
    }
  }, [formKey, isRestored]);

  // Auto-save interval (30s) if dirty (only for new API)
  useEffect(() => {
    if (!isHookForm || !isRestored) return;
    const isDirty = formOrInitialData.formState.isDirty;
    if (!isDirty) return;
    const interval = setInterval(() => saveDraft(), intervalMs);
    return () => clearInterval(interval);
  }, [isHookForm, isRestored, saveDraft, formOrInitialData?.formState?.isDirty]);

  // Save on visibility change or page hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (!isHookForm || formOrInitialData.formState.isDirty) saveDraft();
      }
    };
    const handlePageHide = () => {
      if (!isHookForm || formOrInitialData.formState.isDirty) saveDraft();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [isHookForm, saveDraft, formOrInitialData?.formState?.isDirty]);

  const clearDraft = useCallback(async () => {
    try {
      await db.drafts.delete(formKey);
      setDraft(null);
      setLastSaved(null);
    } catch (err) {
      console.error('Failed to clear draft', err);
    }
  }, [formKey]);

  const relativeSavedTime = lastSaved ? new Date(lastSaved).toLocaleTimeString() : '';

  return { 
    isRestored, 
    clearDraft,
    draft,
    saveDraft,
    hasRestoredDraft: isRestored,
    status,
    isLoading: !isRestored,
    relativeSavedTime
  };
}
