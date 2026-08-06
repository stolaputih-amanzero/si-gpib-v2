import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/offline/dexie';

const getUserMock = vi.fn();
const maybeSingleMock = vi.fn();
const rpcMock = vi.fn();
const queryChain = {
  select: () => queryChain,
  eq: () => queryChain,
  is: () => queryChain,
  maybeSingle: maybeSingleMock,
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
    from: () => queryChain,
    rpc: rpcMock,
  }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/offline/sync-manager', () => ({
  syncManager: { processQueue: vi.fn() },
}));

import { createLogPastoralAction, submitLogPastoral } from '@/lib/domains/pastoral/pastoral.service';

const PJ_USER = { id: 'uuid-pj', user_metadata: { id_pendeta: 'PDT-19060024' } };
const validInput = () => ({
  requestId: crypto.randomUUID(),
  id_pos: 'POS-13055',
  tgl: '2026-08-08',
  kegiatan: 'Kunjungan Pastoral',
  jml_jiwa: 12,
  catatan: 'Uji otomatis',
});

beforeEach(async () => {
  await db.pendingSubmissions.clear();
  getUserMock.mockResolvedValue({ data: { user: PJ_USER }, error: null });
  maybeSingleMock.mockResolvedValue({ data: { id_tugas: 'TGS-1700000000000-001' }, error: null });
  rpcMock.mockResolvedValue({ error: null });
});

describe('createLogPastoralAction (Server Action)', () => {
  it('validasi Zod gagal → ditolak tanpa menyentuh Supabase', async () => {
    const res = await createLogPastoralAction({ ...validInput(), kegiatan: 'ab' });
    expect(res.success).toBe(false);
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it('tanpa sesi → Unauthorized', async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    const res = await createLogPastoralAction(validInput());
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/sesi|login/i);
  });

  it('RBAC: tanpa penugasan aktif di Pos tujuan → ditolak (VP-10 lapis unit)', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    const res = await createLogPastoralAction(validInput());
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/tidak ditugaskan/i);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('sukses: RPC dipanggil dengan requestId untuk idempotensi', async () => {
    const input = validInput();
    const res = await createLogPastoralAction(input);
    expect(res.success).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith('create_log_pastoral_atomic', expect.objectContaining({
      p_request_id: input.requestId,
      p_id_pendeta: 'PDT-19060024',
      p_id_pos: input.id_pos,
    }));
  });

  it('idempoten: duplicate key uq_sys_txn_logs_request → sukses tanpa duplikat (VP-9 lapis unit)', async () => {
    rpcMock.mockResolvedValue({
      error: { message: 'duplicate key value violates unique constraint "uq_sys_txn_logs_request"' },
    });
    const res = await createLogPastoralAction(validInput());
    expect(res).toMatchObject({ success: true, idempotent: true });
  });
});

describe('submitLogPastoral (orkestrator offline)', () => {
  it('VP-7 lapis unit: offline → masuk pendingSubmissions dengan requestId utuh', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const input = validInput();
    const res = await submitLogPastoral(input);
    expect(res).toMatchObject({ success: true, queued: true });
    const [queued] = await db.pendingSubmissions.toArray();
    expect(queued).toMatchObject({
      requestId: input.requestId,
      operationType: 'rpc',
      targetIdentifier: 'create_log_pastoral',
      status: 'pending',
    });
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });
});
