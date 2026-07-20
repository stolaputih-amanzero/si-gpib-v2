import { formatDistanceToNow, isAfter, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

export interface DraftStorageItem<T = any> {
  data: T;
  timestamp: string; // ISO string
  formKey: string;
}

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'pin', 'credit_card', 'auth'];

/**
 * Filter out sensitive fields before persisting to localStorage
 */
function sanitizeDraftData<T extends Record<string, any>>(data: T): Partial<T> {
  if (!data || typeof data !== 'object') return data;
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
    if (!isSensitive) {
      sanitized[key] = value;
    }
  }

  return sanitized as Partial<T>;
}

/**
 * Save form draft to localStorage
 */
export function saveFormDraft<T extends Record<string, any>>(key: string, data: T): void {
  if (typeof window === 'undefined' || !key) return;

  try {
    const sanitizedData = sanitizeDraftData(data);
    const item: DraftStorageItem<Partial<T>> = {
      data: sanitizedData,
      timestamp: new Date().toISOString(),
      formKey: key,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (err) {
    console.warn('Failed to save draft to localStorage:', err);
  }
}

/**
 * Retrieve form draft from localStorage (discarding items older than 7 days)
 */
export function getFormDraft<T = any>(key: string): DraftStorageItem<T> | null {
  if (typeof window === 'undefined' || !key) return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: DraftStorageItem<T> = JSON.parse(raw);
    const savedDate = new Date(parsed.timestamp);
    const cutoffDate = subDays(new Date(), 7);

    // If draft is older than 7 days, remove it
    if (!isAfter(savedDate, cutoffDate)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn('Failed to read draft from localStorage:', err);
    return null;
  }
}

/**
 * Remove a single draft by key
 */
export function clearFormDraft(key: string): void {
  if (typeof window === 'undefined' || !key) return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('Failed to clear draft:', err);
  }
}

/**
 * Scan localStorage and remove drafts older than 7 days
 */
export function cleanExpiredDrafts(): void {
  if (typeof window === 'undefined') return;

  try {
    const cutoffDate = subDays(new Date(), 7);
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('draft:') || key.startsWith('form_draft:'))) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const item: DraftStorageItem = JSON.parse(raw);
            if (item.timestamp) {
              const savedDate = new Date(item.timestamp);
              if (!isAfter(savedDate, cutoffDate)) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // Remove invalid JSON drafts
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('Failed to clean expired drafts:', err);
  }
}

/**
 * Format timestamp into Indonesian relative string using date-fns
 */
export function getDraftRelativeTime(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  } catch {
    return 'Baru saja';
  }
}
