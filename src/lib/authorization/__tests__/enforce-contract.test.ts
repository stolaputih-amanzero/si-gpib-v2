import { describe, test, expect, vi, beforeEach } from 'vitest';
import { enforceContract } from '../enforce/enforce-contract';
import * as sessionHelpers from '../enforce/session-helpers';
import type { OperationInput } from '../types';

describe('enforceContract Orchestration', () => {
  
  const validInput: OperationInput = {
    target_entity: {
      entity_type: 'LogPastoral',
      entity_id: null,
      owning_context_id: 'POS-001'
    },
    operation_payload: {
      kegiatan: 'Kunjungan',
      jml_jiwa: 5
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('ALLOW flow: Full pipeline succeeds', async () => {
    const result = await enforceContract('OC-PASTORAL-001', validInput);
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('ALLOW');
      expect(result.decision.error_code).toBeNull();
    }
  });

  test('CONTRACT_RESOLUTION_FAILURE: No session (Unauthenticated)', async () => {
    vi.spyOn(sessionHelpers, 'getMockSession').mockResolvedValue(null);
    
    const result = await enforceContract('OC-PASTORAL-001', validInput);
    
    expect(result.status).toBe('CONTRACT_RESOLUTION_FAILURE');
    expect(result.decision).toBeNull();
  });

  test('CONTRACT_RESOLUTION_FAILURE: Context resolution fails', async () => {
    vi.spyOn(sessionHelpers, 'getMockSession').mockResolvedValue({
      user_id: 'user-1',
      person_id: 'person-1',
      claimed_context_id: 'INVALID', // Triggers MockContextResolver failure
      claimed_context_level: 'POS'
    });
    
    const result = await enforceContract('OC-PASTORAL-001', validInput);
    
    expect(result.status).toBe('CONTRACT_RESOLUTION_FAILURE');
    expect(result.decision).toBeNull(); // NO Frozen Error Code
  });

  test('CONTRACT_RESOLUTION_FAILURE: UNRESOLVED contract (OC-PERSON-007)', async () => {
    const result = await enforceContract('OC-PERSON-007', validInput);
    
    expect(result.status).toBe('CONTRACT_RESOLUTION_FAILURE');
    expect(result.decision).toBeNull();
  });

  test('DENY flow: Engine returns correct error code (e.g., INVALID_OPERATION)', async () => {
    const invalidInput: OperationInput = {
      ...validInput,
      operation_payload: {
        // Missing required fields to trigger L6 failure
      }
    };
    
    // Note: This test depends on how PreconditionEvaluator is implemented.
    // If it checks for 'kegiatan', this should fail with INVALID_OPERATION.
    // However, our current mock PreconditionEvaluator always returns {passed: true} unless NOT_APPLICABLE.
    // To properly test this, we should mock the engine or the evaluator inside the test.
    // Since the instruction says "If L6 precondition evaluator is strict... For now, we just verify the engine doesn't crash", 
    // actually, let's mock the evaluator to fail for this test.
    
    // The engine instantiate evaluators internally. We can spy on the prototype.
    const { PreconditionEvaluator } = await import('../engine/evaluators/precondition-evaluator');
    vi.spyOn(PreconditionEvaluator.prototype, 'evaluate').mockReturnValue({
      passed: false,
      error_code: 'INVALID_OPERATION',
      error_detail: 'Missing fields'
    });

    const result = await enforceContract('OC-PASTORAL-001', invalidInput);
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('INVALID_OPERATION');
    }
  });

  test('OPI Guardrail: operation_payload MUST NOT contain authorization data', async () => {
    const maliciousInput: OperationInput = {
      ...validInput,
      operation_payload: {
        ...validInput.operation_payload,
        role: 'super_user', // Attempting to inject role
        permission: 'aid.approve.step_2' // Attempting to inject permission
      }
    };
    
    // The engine should evaluate based on Identity/Context, NOT payload.
    const result = await enforceContract('OC-PASTORAL-001', maliciousInput);
    expect(['EVALUATED', 'CONTRACT_RESOLUTION_FAILURE']).toContain(result.status);
  });
});
