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

describe('Integration: DENY Flows & Error Taxonomy', () => {
  
  test('L2 Failure: Wrong role for operation -> NOT_AUTHORIZED', async () => {
    const result = await enforceContract('OC-USER-002', {
      target_entity: { entity_type: 'User', entity_id: 'L2_FAIL', owning_context_id: 'POS-001' },
      operation_payload: {}
    });
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('NOT_AUTHORIZED');
    }
  });

  test('L3 Failure: Wrong context -> INVALID_CONTEXT', async () => {
    const result = await enforceContract('OC-PASTORAL-001', {
      target_entity: { entity_type: 'PastoralLog', entity_id: 'L3_FAIL', owning_context_id: 'JEMAAT-001' },
      operation_payload: {}
    });
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('INVALID_CONTEXT');
    }
  });

  test('L4 Failure: No relationship to target -> RELATIONSHIP_VIOLATION', async () => {
    const result = await enforceContract('OC-PASTORAL-002', {
      target_entity: { entity_type: 'PastoralLog', entity_id: 'L4_FAIL', owning_context_id: 'POS-001' },
      operation_payload: {}
    });
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('RELATIONSHIP_VIOLATION');
    }
  });

  test('L5 Failure: Wrong lifecycle state -> INVALID_LIFECYCLE_STATE', async () => {
    const result = await enforceContract('OC-AID-003', {
      target_entity: { entity_type: 'AidRequest', entity_id: 'L5_FAIL', owning_context_id: 'POS-001' },
      operation_payload: { currentState: 'Diajukan' }
    });
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('INVALID_LIFECYCLE_STATE');
    }
  });

  test('L6 Failure: Missing preconditions -> INVALID_OPERATION', async () => {
    const result = await enforceContract('OC-PASTORAL-001', {
      target_entity: { entity_type: 'PastoralLog', entity_id: 'L6_FAIL', owning_context_id: 'POS-001' },
      operation_payload: {} // missing required fields
    });
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('INVALID_OPERATION');
    }
  });
});
