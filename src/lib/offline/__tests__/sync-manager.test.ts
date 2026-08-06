import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/offline/dexie';

const getSessionMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: getSessionMock } }),
}));

const dispatchMock = vi.fn();
vi.mock('@/lib/offline/action-dispatcher', () => ({
  dispatchSubmission: (...args: unknown[]) => dispatchMock(...args),
}));

import { syncManager } from '@/lib/offline/sync-manager';

const VALID_SESSION = { data: { session: { access_token: 'x' } }, error: null };

function seedItem(overrides: Record<string, unknown> = {}) {
  return db.pendingSubmissions.add({
    requestId: crypto.randomUUID(),
    operationType: 'rpc' as const,
    targetIdentifier: 'create_log_pastoral',
    payload: { kegiatan: 'Uji' },
    status: 'pending' as const,
    attempts: 0,
    createdAt: Date.now(),
    ...overrides,
  });
}

beforeEach(async () => {
  await db.pendingSubmissions.clear();
  await db.deadLetters.clear();
  getSessionMock.mockResolvedValue(VALID_SESSION);
  dispatchMock.mockReset();
});

describe('SyncManager (VP-8)', () => {
  it('P0: berhenti total saat sesi kedaluwarsa', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null });
    await seedItem();
    await syncManager.processQueue();
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(await db.pendingSubmissions.count()).toBe(1); // tetap pending, bukan hilang
  });

  it('sukses: item dihapus dari queue', async () => {
    dispatchMock.mockResolvedValue({ success: true });
    await seedItem();
    await syncManager.processQueue();
    expect(await db.pendingSubmissions.count()).toBe(0);
  });

  it('gagal transient: status failed + attempts bertambah', async () => {
    dispatchMock.mockRejectedValue(new Error('network timeout'));
    await seedItem();
    await syncManager.processQueue();
    const [item] = await db.pendingSubmissions.toArray();
    expect(item.status).toBe('failed');
    expect(item.attempts).toBeGreaterThanOrEqual(1);
    expect(item.lastError).toMatch(/timeout/i);
  });

  it('gagal permanen 4xx: dipindah ke DeadLetter Queue', async () => {
    dispatchMock.mockRejectedValue(Object.assign(new Error('RBAC_VIOLATION'), { status: 422 }));
    const id = await seedItem();
    await syncManager.processQueue();
    expect(await db.pendingSubmissions.count()).toBe(0);
    const [dl] = await db.deadLetters.toArray();
    expect(dl.failureReason).toMatch(/RBAC_VIOLATION/);
    expect(dl.httpStatus).toBe(422);
    expect(id).toBeTruthy();
  });

  it('max attempts tercapai: transient pun masuk DLQ', async () => {
    dispatchMock.mockRejectedValue(new Error('flaky'));
    await seedItem({ attempts: 4 }); // MAX_SYNC_ATTEMPTS - 1
    await syncManager.processQueue();
    expect(await db.deadLetters.count()).toBe(1);
  });

  it('backoff: item failed baru-baru ini dilewati', async () => {
    dispatchMock.mockResolvedValue({ success: true });
    await seedItem({ status: 'failed', attempts: 3, lastAttemptAt: Date.now() });
    await syncManager.processQueue();
    expect(dispatchMock).not.toHaveBeenCalled(); // delay 4s belum lewat
  });

  it('idempoten: respons {idempotent:true} tetap menghapus queue', async () => {
    dispatchMock.mockResolvedValue({ success: true, idempotent: true });
    await seedItem();
    await syncManager.processQueue();
    expect(await db.pendingSubmissions.count()).toBe(0);
  });
});
