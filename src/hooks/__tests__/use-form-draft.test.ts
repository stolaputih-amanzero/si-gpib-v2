import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { db } from '@/lib/offline/dexie';
import { useFormDraft } from '@/hooks/use-form-draft';

const KEY = 'pastoral-new-test';

function setup() {
  return renderHook(() => {
    const form = useForm<{ kegiatan: string; catatan: string }>({
      defaultValues: { kegiatan: '', catatan: '' },
    });
    const draft = useFormDraft(KEY, form, 50);
    return { form, draft };
  });
}

beforeEach(async () => { await db.drafts.clear(); });
afterEach(async () => { await db.drafts.clear(); });

describe('useFormDraft (VP-4 & VP-5)', () => {
  it('VP-4: draft dipulihkan saat mount', async () => {
    await db.drafts.put({ formKey: KEY, data: { kegiatan: 'Pemakaman', catatan: 'Keluarga Yohanes' }, timestamp: Date.now() });
    const { result } = setup();
    await waitFor(() => expect(result.current.form.getValues('kegiatan')).toBe('Pemakaman'));
    expect(result.current.form.getValues('catatan')).toBe('Keluarga Yohanes');
  });

  it('VP-4: auto-save interval menulis ke Dexie saat dirty', async () => {
    const { result } = setup();
    act(() => { result.current.form.setValue('catatan', 'Auto-save uji', { shouldDirty: true }); });
    await waitFor(async () => {
      const draft = await db.drafts.get(KEY);
      expect(draft?.data).toMatchObject({ catatan: 'Auto-save uji' });
    }, { timeout: 1000 });
  });

  it('VP-5: visibilitychange hidden memicu save segera (tanpa tunggu interval)', async () => {
    const { result } = setup();
    act(() => { result.current.form.setValue('kegiatan', 'Katekisasi', { shouldDirty: true }); });
    act(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await waitFor(async () => {
      const draft = await db.drafts.get(KEY);
      expect(draft?.data).toMatchObject({ kegiatan: 'Katekisasi' });
    }, { timeout: 500 });
  });

  it('BR #17: draft > 30 hari dibersihkan saat mount', async () => {
    const fortyDaysAgo = Date.now() - 40 * 24 * 60 * 60 * 1000;
    await db.drafts.put({ formKey: 'stale-form', data: { a: 1 }, timestamp: fortyDaysAgo });
    setup();
    await waitFor(async () => { expect(await db.drafts.get('stale-form')).toBeUndefined(); });
  });

  it('clearDraft menghapus draft setelah submit sukses', async () => {
    await db.drafts.put({ formKey: KEY, data: { kegiatan: 'X' }, timestamp: Date.now() });
    const { result } = setup();
    await act(async () => { await result.current.draft.clearDraft(); });
    expect(await db.drafts.get(KEY)).toBeUndefined();
  });
});
