import { describe, it, expect } from 'vitest';
import { CONTRACT_REGISTRY } from '../../registry/contract-registry';
import { enforceContract } from '../../enforce/enforce-contract';
import { DefaultContractResolver } from '../../engine/contract-resolver';

describe('Contract Registry Integrity', () => {
  it('should have exactly 41 contracts (40 ACTIVE, 1 UNRESOLVED)', () => {
    expect(CONTRACT_REGISTRY.size).toBe(41);
    
    let activeCount = 0;
    let unresolvedCount = 0;
    let otherCount = 0;
    
    for (const [id, def] of CONTRACT_REGISTRY.entries()) {
      if (def.registry_status === 'ACTIVE') {
        activeCount++;
      } else if (def.registry_status === 'UNRESOLVED') {
        unresolvedCount++;
        // As explicitly noted by the Architect, OC-PERSON-007 is the only UNRESOLVED contract.
        expect(id).toBe('OC-PERSON-007'); 
      } else {
        otherCount++;
      }
    }
    
    expect(activeCount).toBe(40);
    expect(unresolvedCount).toBe(1);
    expect(otherCount).toBe(0);
  });

  it('should reject NON_EXISTENT contract (L1 Resolution Failure)', async () => {
    // Testing the resolver directly to avoid TS compiler errors for invalid literal type
    const resolver = new DefaultContractResolver();
    const resolution = await resolver.resolve('NON_EXISTENT' as any);
    expect(resolution.status).toBe('NOT_FOUND');

    // Also testing enforceContract directly (with as any to bypass TS strictness)
    const result = await enforceContract('NON_EXISTENT' as any, {
      target_entity: { entity_type: 'Aid', entity_id: '123', owning_context_id: 'C-1' },
      operation_payload: {}
    });
    
    expect(result.status).toBe('CONTRACT_RESOLUTION_FAILURE');
  });

  it('should reject UNRESOLVED contract (L1 Resolution Failure)', async () => {
    // A-1 UNRESOLVED contract must never evaluate to ALLOW
    const result = await enforceContract('OC-PERSON-007', {
      target_entity: { entity_type: 'Person', entity_id: '123', owning_context_id: 'C-1' },
      operation_payload: {}
    });
    
    expect(result.status).toBe('CONTRACT_RESOLUTION_FAILURE');
  });
});
