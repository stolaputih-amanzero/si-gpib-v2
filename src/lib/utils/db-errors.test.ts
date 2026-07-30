import { describe, it, expect } from 'vitest';
import { translateDbError, isForeignKeyViolation } from './db-errors';

describe('translateDbError', () => {
  it('menerjemahkan 23503 (RESTRICT) menjadi pesan sejarah yang manusiawi', () => {
    const info = translateDbError({
      code: '23503',
      message: 'update or delete on table "m_pendeta" violates foreign key constraint...',
    });
    expect(info.code).toBe('23503');
    expect(info.severity).toBe('warning');
    expect(info.isRetryable).toBe(false);
    expect(info.userMessage).toContain('riwayat pelayanan');
    expect(info.userMessage).not.toContain('foreign key'); // tidak boleh mentah
  });

  it('menerjemahkan RPC forbidden (P0001)', () => {
    const info = translateDbError({ code: 'P0001', message: 'forbidden' });
    expect(info.title).toBe('Akses Ditolak');
    expect(info.severity).toBe('error');
  });

  it('fallback ke pesan generic untuk error tak dikenal', () => {
    const info = translateDbError(new Error('network down'));
    expect(info.code).toBe('UNKNOWN');
    expect(info.isRetryable).toBe(true);
  });

  it('isForeignKeyViolation mendeteksi 23503', () => {
    expect(isForeignKeyViolation({ code: '23503' })).toBe(true);
    expect(isForeignKeyViolation({ code: '23505' })).toBe(false);
  });
});
