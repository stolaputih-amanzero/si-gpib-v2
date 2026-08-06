import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import {
  submitPengajuanBantuan,
  reviewByKMJ,
  reviewBySuperUser,
  ajukanUlangBantuan,
} from '../bantuan.service';

// Helper: mock Supabase client
function createMockSupabase(overrides = {}, userRole = 'pj', userId = 'test-user-uuid', userScope = {}) {
  const mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      }),
    },
    from: vi.fn().mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { id: userId, role: userRole, status: 'Aktif', ...userScope }, 
            error: null 
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        ...overrides,
      };
    }),
  };
  return mockSupabase;
}

describe('Bantuan Service', () => {
  describe('submitPengajuanBantuan', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should reject if user is not the applicant', async () => {
      const mockSupabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ 
          data: { id_ajuan: '1', status: 'Draft', diajukan_oleh: 'other-user' }, 
          error: null 
        }),
      });
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await submitPengajuanBantuan({ id_ajuan: '1' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('FORBIDDEN');
    });

    it('should reject if status is not Draft', async () => {
      const mockSupabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ 
          data: { id_ajuan: '1', status: 'Pending_KMJ', diajukan_oleh: 'test-user-uuid' }, 
          error: null 
        }),
      });
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await submitPengajuanBantuan({ id_ajuan: '1' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('INVALID_STATUS');
    });

    it('should transition Draft → Pending_KMJ on success', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: { status: 'Pending_KMJ' }, error: null });
      
      const mockSupabase = createMockSupabase({
        update: mockUpdate,
        select: mockSelect,
        single: mockSingle,
      });
      
      // Override first single (getPengajuan) to return Draft
      mockSupabase.from = vi.fn().mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'test-user-uuid', role: 'pj', status: 'Aktif' }, error: null }),
          };
        }
        if (table === 't_pengajuan_bantuan') {
          return {
            select: mockSelect,
            update: mockUpdate,
            eq: vi.fn().mockReturnThis(),
            single: vi.fn()
              .mockResolvedValueOnce({ data: { id_ajuan: '1', status: 'Draft', diajukan_oleh: 'test-user-uuid' }, error: null })
              .mockResolvedValueOnce({ data: { id_ajuan: '1', status: 'Pending_KMJ' }, error: null }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null })
        };
      });

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await submitPengajuanBantuan({ id_ajuan: '1' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('Pending_KMJ');
      }
    });
  });

  describe('reviewByKMJ', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should reject if user role is not kmj', async () => {
      const mockSupabase = createMockSupabase({}, 'pj');
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await reviewByKMJ({ id_ajuan: '1', keputusan: 'approve' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('FORBIDDEN');
    });

    it('should reject if pengajuan status is not Pending_KMJ', async () => {
      const mockSupabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ data: { id_ajuan: '1', status: 'Pending_Mupel' }, error: null })
      }, 'kmj');
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await reviewByKMJ({ id_ajuan: '1', keputusan: 'approve' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('INVALID_STATUS');
    });

    it('should reject if pengajuan is from different jemaat (scope violation)', async () => {
      const mockSupabase = createMockSupabase({}, 'kmj', 'kmj-uuid', { id_induk: 'induk-1' });
      
      mockSupabase.from = vi.fn().mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'kmj-uuid', role: 'kmj', id_induk: 'induk-1', status: 'Aktif' }, error: null }),
          };
        }
        if (table === 't_pengajuan_bantuan') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id_ajuan: '1', status: 'Pending_KMJ', id_pos: 'pos-2' }, error: null }),
          };
        }
        if (table === 'm_pos_pelkes') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id_induk: 'induk-2' }, error: null }),
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({data: null}) };
      });
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await reviewByKMJ({ id_ajuan: '1', keputusan: 'approve' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('SCOPE_VIOLATION');
    });
  });

  describe('reviewBySuperUser', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should reject if user role is not super_user', async () => {
      const mockSupabase = createMockSupabase({}, 'admin_mupel');
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await reviewBySuperUser({ id_ajuan: '1', keputusan: 'approve' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('FORBIDDEN');
    });

    it('should reject if pengajuan status is not Pending_Sinode', async () => {
      const mockSupabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ data: { id_ajuan: '1', status: 'Pending_Mupel' }, error: null })
      }, 'super_user');
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await reviewBySuperUser({ id_ajuan: '1', keputusan: 'approve' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('INVALID_STATUS');
    });
  });

  describe('ajukanUlangBantuan', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should reject if pengajuan status is not Rejected', async () => {
      const mockSupabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ data: { id_ajuan: '1', status: 'Approved' }, error: null })
      }, 'pj');
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await ajukanUlangBantuan({ id_ajuan_lama: '1' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('INVALID_STATUS');
    });

    it('should reject if user is not the original applicant', async () => {
      const mockSupabase = createMockSupabase({
        single: vi.fn().mockResolvedValue({ data: { id_ajuan: '1', status: 'Rejected', diajukan_oleh: 'other' }, error: null })
      }, 'pj');
      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await ajukanUlangBantuan({ id_ajuan_lama: '1' });
      expect(result.success).toBe(false);
      expect((result as any).code).toBe('FORBIDDEN');
    });

    it('should create new Draft record with id_pengajuan_sebelumnya reference', async () => {
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: { id_ajuan: 'NEW-1', status: 'Draft', id_pengajuan_sebelumnya: '1' }, error: null });
      
      const mockSupabase = createMockSupabase({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      }, 'pj');
      
      mockSupabase.from = vi.fn().mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'test-user-uuid', role: 'pj', status: 'Aktif' }, error: null }),
          };
        }
        if (table === 't_pengajuan_bantuan') {
          return {
            select: mockSelect,
            insert: mockInsert,
            eq: vi.fn().mockReturnThis(),
            single: vi.fn()
              .mockResolvedValueOnce({ data: { id_ajuan: '1', status: 'Rejected', diajukan_oleh: 'test-user-uuid', id_pos: 'pos-1', jenis_bantuan: 'Bantuan' }, error: null })
              .mockResolvedValueOnce({ data: { id_ajuan: 'NEW-1', status: 'Draft', id_pengajuan_sebelumnya: '1' }, error: null }),
          };
        }
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      });

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await ajukanUlangBantuan({ id_ajuan_lama: '1' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('Draft');
        expect((result.data as any).id_pengajuan_sebelumnya).toBe('1');
      }
    });
  });
});
