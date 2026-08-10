import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthorizationEngine } from '../engine/authorization-engine';
import { PermissionEvaluator } from '../engine/evaluators/permission-evaluator';
import { ContextEvaluator } from '../engine/evaluators/context-evaluator';
import { RelationshipEvaluator } from '../engine/evaluators/relationship-evaluator';
import { LifecycleEvaluator } from '../engine/evaluators/lifecycle-evaluator';
import { PreconditionEvaluator } from '../engine/evaluators/precondition-evaluator';
import type { AuthorizationEngineDeps } from '../engine/authorization-engine';

describe('AuthorizationEngine', () => {
  let engine: AuthorizationEngine;
  let mockDeps: AuthorizationEngineDeps;

  beforeEach(() => {
    engine = new AuthorizationEngine();
    mockDeps = {
      identity: {} as any,
      activeContext: {} as any,
    };

    // Reset all mocks to pass by default
    vi.spyOn(PermissionEvaluator.prototype, 'evaluate').mockReturnValue({ passed: true });
    vi.spyOn(ContextEvaluator.prototype, 'evaluate').mockReturnValue({ passed: true });
    vi.spyOn(RelationshipEvaluator.prototype, 'evaluate').mockReturnValue({ passed: true });
    vi.spyOn(LifecycleEvaluator.prototype, 'evaluate').mockReturnValue({ passed: true });
    vi.spyOn(PreconditionEvaluator.prototype, 'evaluate').mockReturnValue({ passed: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. ALLOW flow: All evaluators pass', async () => {
    const result = await engine.evaluate('OC-ORG-001', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('ALLOW');
      expect(result.decision.error_code).toBeNull();
    }
  });

  it('2. DENY at L2: Permission evaluator fails', async () => {
    vi.spyOn(PermissionEvaluator.prototype, 'evaluate').mockReturnValue({ 
      passed: false, error_code: 'NOT_AUTHORIZED', error_detail: 'Missing role' 
    });

    const result = await engine.evaluate('OC-ORG-001', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('NOT_AUTHORIZED');
    }

    // Short circuit check
    expect(ContextEvaluator.prototype.evaluate).not.toHaveBeenCalled();
  });

  it('3. DENY at L3: Context evaluator fails', async () => {
    vi.spyOn(ContextEvaluator.prototype, 'evaluate').mockReturnValue({ 
      passed: false, error_code: 'INVALID_CONTEXT', error_detail: 'Wrong scope' 
    });

    const result = await engine.evaluate('OC-ORG-001', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('INVALID_CONTEXT');
    }
  });

  it('4. DENY at L4: Relationship evaluator fails', async () => {
    vi.spyOn(RelationshipEvaluator.prototype, 'evaluate').mockReturnValue({ 
      passed: false, error_code: 'RELATIONSHIP_VIOLATION', error_detail: 'Not owner' 
    });

    const result = await engine.evaluate('OC-ORG-001', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('RELATIONSHIP_VIOLATION');
    }
  });

  it('5. DENY at L5: Lifecycle evaluator fails', async () => {
    vi.spyOn(LifecycleEvaluator.prototype, 'evaluate').mockReturnValue({ 
      passed: false, error_code: 'INVALID_LIFECYCLE_STATE', error_detail: 'Wrong state' 
    });

    const result = await engine.evaluate('OC-ORG-001', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('INVALID_LIFECYCLE_STATE');
    }
  });

  it('6. DENY at L6: Precondition evaluator fails', async () => {
    vi.spyOn(PreconditionEvaluator.prototype, 'evaluate').mockReturnValue({ 
      passed: false, error_code: 'INVALID_OPERATION', error_detail: 'Missing field' 
    });

    const result = await engine.evaluate('OC-ORG-001', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('DENY');
      expect(result.decision.error_code).toBe('INVALID_OPERATION');
    }
  });

  it('7. CONTRACT_RESOLUTION_FAILURE (OC-PERSON-007)', async () => {
    // Unresolved contract should fail resolution
    const result = await engine.evaluate('OC-PERSON-007', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    expect(result.status).toBe('CONTRACT_RESOLUTION_FAILURE');
    if (result.status === 'CONTRACT_RESOLUTION_FAILURE') {
      expect(result.decision).toBeNull();
    }

    expect(PermissionEvaluator.prototype.evaluate).not.toHaveBeenCalled();
  });

  it('8. NOT_APPLICABLE skipping', async () => {
    // Restore mocks so actual real instances run their NOT_APPLICABLE check
    vi.restoreAllMocks();
    
    // OC-ORG-004 has L5 and L6 NOT_APPLICABLE
    const result = await engine.evaluate('OC-ORG-004', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    // The actual evaluators return { passed: true } automatically if NOT_APPLICABLE
    expect(result.status).toBe('EVALUATED');
    if (result.status === 'EVALUATED') {
      expect(result.decision.result).toBe('ALLOW');
    }
  });

  it('9. Binary Decision (No partial states)', async () => {
    const result = await engine.evaluate('OC-ORG-001', { target_entity: 'test', operation_payload: {} }, mockDeps);
    
    if (result.status === 'EVALUATED') {
      // Must be exactly 'ALLOW' or 'DENY'
      expect(['ALLOW', 'DENY']).toContain(result.decision.result);
    }
  });
});
