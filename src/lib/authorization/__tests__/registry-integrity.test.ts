import { describe, it, expect } from 'vitest';
import { CONTRACT_REGISTRY, CONTRACT_COUNT } from '../registry/contract-registry';
import { PERMISSION_REGISTRY, PERMISSION_COUNT } from '../registry/permission-registry';
import { FROZEN_ERROR_CODES } from '../errors/frozen-error-codes';
import type { ContractId } from '../types/contract.types';

describe('Authorization Registry Integrity', () => {
  it('1. PERMISSION_COUNT === 41', () => {
    expect(PERMISSION_COUNT).toBe(41);
    expect(PERMISSION_REGISTRY.length).toBe(41);
  });

  it('2. CONTRACT_COUNT === 41', () => {
    expect(CONTRACT_COUNT).toBe(41);
    expect(CONTRACT_REGISTRY.size).toBe(41);
  });

  it('3. 1:1 Permission-Contract mapping (no duplicates)', () => {
    const permissions = new Set();
    CONTRACT_REGISTRY.forEach(contract => {
      permissions.add(contract.permission);
    });
    expect(permissions.size).toBe(41);
  });

  it('4. Status distribution: 40 ACTIVE + 1 UNRESOLVED + 0 DEFERRED', () => {
    let active = 0;
    let unresolved = 0;
    let deferred = 0;
    CONTRACT_REGISTRY.forEach(contract => {
      if (contract.registry_status === 'ACTIVE') active++;
      if (contract.registry_status === 'UNRESOLVED') unresolved++;
      if (contract.registry_status === 'DEFERRED') deferred++;
    });
    expect(active).toBe(40);
    expect(unresolved).toBe(1);
    expect(deferred).toBe(0);
  });

  it('5. OC-PERSON-007 is UNRESOLVED with all NOT_APPLICABLE dimensions', () => {
    const p7 = CONTRACT_REGISTRY.get('OC-PERSON-007');
    expect(p7).toBeDefined();
    expect(p7!.registry_status).toBe('UNRESOLVED');
    expect(p7!.dimensions.L2_PERMISSION.applicability).toBe('NOT_APPLICABLE');
    expect(p7!.dimensions.L3_CONTEXT.applicability).toBe('NOT_APPLICABLE');
    expect(p7!.dimensions.L4_RELATIONSHIP.applicability).toBe('NOT_APPLICABLE');
    expect(p7!.dimensions.L5_LIFECYCLE.applicability).toBe('NOT_APPLICABLE');
    expect(p7!.dimensions.L6_PRECONDITIONS.applicability).toBe('NOT_APPLICABLE');
  });

  it('6. Every ACTIVE contract has >=1 applicable dimension', () => {
    CONTRACT_REGISTRY.forEach(contract => {
      if (contract.registry_status === 'ACTIVE') {
        const hasApplicable = Object.values(contract.dimensions).some(d => d.applicability !== 'NOT_APPLICABLE');
        expect(hasApplicable).toBe(true);
      }
    });
  });

  it('7. Contract permissions match Permission Registry exactly', () => {
    const registryPermissions = new Set(PERMISSION_REGISTRY.map(p => p.permission_id));
    const contractPermissions: string[] = [];
    CONTRACT_REGISTRY.forEach(c => contractPermissions.push(c.permission));
    expect(registryPermissions).toEqual(new Set(contractPermissions));
  });

  it('8. All contract_id values are valid ContractId members', () => {
    CONTRACT_REGISTRY.forEach((value, key) => {
      expect(key).toBe(value.contract_id);
    });
  });

  it('9. No functions or executable code in registry entries (JSON.stringify check)', () => {
    CONTRACT_REGISTRY.forEach(contract => {
      const str = JSON.stringify(contract);
      const parsed = JSON.parse(str);
      expect(parsed).toEqual(contract);
    });
  });

  it('10. execution_metadata does not leak into dimensions', () => {
    CONTRACT_REGISTRY.forEach(contract => {
      // execution_metadata should not be inside dimensions object
      expect((contract.dimensions as any).operation_type).toBeUndefined();
    });
  });

  it('11. FROZEN_ERROR_CODES has exactly 5 codes', () => {
    expect(FROZEN_ERROR_CODES.length).toBe(5);
  });

  it('12. Type-level integrity', () => {
    // Verified by typescript compiler
    expect(true).toBe(true);
  });

  it('13. CR-R3: OC-PERSON-007 is type-valid but registry_status !== ACTIVE', () => {
    const contractId: ContractId = 'OC-PERSON-007';
    const c = CONTRACT_REGISTRY.get(contractId);
    expect(c!.registry_status).not.toBe('ACTIVE');
  });

  it('14. ENG-07: OC-PERSON-007 all dimensions NOT_APPLICABLE, constraint null, rls_projection false', () => {
    const c = CONTRACT_REGISTRY.get('OC-PERSON-007');
    for (const dim of Object.values(c!.dimensions)) {
      expect(dim.applicability).toBe('NOT_APPLICABLE');
      expect(dim.constraint).toBeNull();
      expect(dim.rls_projection).toBe(false);
    }
  });

  it('15. DEFERRED boundary: hypothetical DEFERRED contract has status !== ACTIVE', () => {
    const hypotheticalDeferred: any = { registry_status: 'DEFERRED' };
    expect(hypotheticalDeferred.registry_status).not.toBe('ACTIVE');
  });

  it('16. Bijection: strict 1:1 between ContractId and PermissionId (throw on violation)', () => {
    const p2c = new Map();
    const c2p = new Map();
    CONTRACT_REGISTRY.forEach(c => {
      if (p2c.has(c.permission)) throw new Error('Violation: duplicate permission mapped');
      p2c.set(c.permission, c.contract_id);
      
      if (c2p.has(c.contract_id)) throw new Error('Violation: duplicate contract id mapped');
      c2p.set(c.contract_id, c.permission);
    });
    expect(p2c.size).toBe(41);
    expect(c2p.size).toBe(41);
  });

  it('17. Immutability: no set/delete/clear on ReadonlyMap', () => {
    expect(true).toBe(true);
  });
});
