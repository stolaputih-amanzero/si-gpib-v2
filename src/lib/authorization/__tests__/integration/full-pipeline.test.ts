import { describe, test, expect, vi } from 'vitest';
import { enforceContract } from '../../enforce/enforce-contract';

vi.mock('../../enforce/session-helpers', () => {
  return {
    getMockSession: vi.fn(() => Promise.resolve({
      user_id: 'mock-user-id',
      person_id: 'mock-person-id',
      claimed_context_id: 'POS-001',
      claimed_context_level: 'POS'
    })),
    getClaimedContextFromSession: vi.fn((session) => session.claimed_context_id),
  };
});

describe('Integration: Full Pipeline (ALLOW & UNRESOLVED)', () => {
  
  test('pastoral.create (OC-PASTORAL-001): Full ALLOW flow', async () => {
    // Mock valid session, valid context, valid payload
    const result = await enforceContract('OC-PASTORAL-001', {
      target_entity: { entity_type: 'PastoralLog', entity_id: null, owning_context_id: 'POS-001' },
      operation_payload: { kegiatan: 'Kunjungan', jml_jiwa: 5 }
    });
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('ALLOW');
      expect(result.decision.contract_id).toBe('OC-PASTORAL-001');
      expect(result.decision.error_code).toBeNull();
      
      // Trace details should be populated
      expect(result.context_resolution.active_context?.context_id).toBe('POS-001');
      expect(result.identity_resolution.base_identity.user_account_id).toBe('mock-user-id');
      expect(result.role_binding.effective_system_role).toBeDefined();
    }
  });

  test('person.update_competency (OC-PERSON-007): UNRESOLVED boundary', async () => {
    const result = await enforceContract('OC-PERSON-007', {
      target_entity: { entity_type: 'Person', entity_id: null, owning_context_id: null },
      operation_payload: { nama_kompetensi: 'Sertifikasi A' }
    });
    
    // MUST fail at contract resolution, NEVER reach L2-L6
    expect(result.status).toBe('CONTRACT_RESOLUTION_FAILURE');
    expect(result.decision).toBeNull();
  });
});
