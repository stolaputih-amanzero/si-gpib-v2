/**
 * src/lib/authorization/engine/contract-resolver.ts
 *
 * Contract Resolver — Gate 1B (IContractResolver implementation).
 *
 * Identity Resolution Sequence Step 1 (Part 1 v1.3 §1):
 *   CONTRACT RESOLUTION
 *
 * Ontological authority:
 *   - Gate 1B: Resolver Interfaces v1.0 (FROZEN)
 *   - Part 1 v1.3 §1: Contract Resolution Model
 *   - Gate 1A: Contract Registry (41/41) v2
 *
 * CR-01: Every request MUST reference exactly one Contract ID.
 * CR-02: Invalid/unresolvable Contract → NO Authorization Decision.
 * CR-03: UNRESOLVED contracts → NOT evaluated.
 * CR-R1: Contract Resolution Failure = runtime registry failure.
 * CR-R2: UNRESOLVED/DEFERRED → Contract Resolution Failure.
 * CR-R3: Type-valid ContractId ≠ Registry-resolved ≠ ACTIVE ≠ ALLOW.
 * ENG-07: UNRESOLVED contracts are NEVER evaluated.
 * FAIL-03: Contract resolution failure → No Decision, No Error Code.
 *
 * This resolver reads from the in-memory CONTRACT_REGISTRY (Phase 1).
 * It does NOT make database calls. The registry is immutable (REG-01).
 *
 * SA-A1: Unresolved Contract MUST NOT be converted by inference.
 * PIP-04: Contract Resolution Failure MUST NOT map to NOT_AUTHORIZED.
 * PIP-05: No RLS policy for OC-PERSON-007.
 * PIP-15: C/D/E items MUST NOT be placed in enforceContract().
 * PIP-16: UNRESOLVED/DEFERRED MUST NOT be changed via implementation.
 */

import type {
  ContractId,
  ContractInstance,
} from '../types/contract.types';
import { CONTRACT_REGISTRY } from '../registry/contract-registry';
import type { ResolutionFailure } from './resolver.types';

/**
 * IContractResolver — resolves a ContractId to a ContractInstance.
 *
 * CR-R3: Type-valid ContractId ≠ Registry-resolved ≠ ACTIVE ≠ ALLOW.
 * This resolver enforces the distinction:
 *   - Type-valid: the ContractId is a valid TypeScript literal.
 *   - Registry-resolved: the ContractId exists in CONTRACT_REGISTRY.
 *   - ACTIVE: the contract status is ACTIVE (not UNRESOLVED/DEFERRED).
 *   - ALLOW: only the Engine can produce ALLOW (not this resolver).
 */
export interface IContractResolver {
  resolveContract(
    contractId: ContractId,
  ): Promise<ContractInstance | ResolutionFailure>;
}

/**
 * In-memory implementation of IContractResolver.
 *
 * Reads from the frozen CONTRACT_REGISTRY (Phase 1).
 * No database calls. The registry is the single source of truth
 * for contract definitions (REG-01, REG-02).
 *
 * CR-R2: UNRESOLVED/DEFERRED contracts produce ResolutionFailure.
 * ENG-07: UNRESOLVED contracts are NEVER evaluated by the Engine.
 */
export class InMemoryContractResolver implements IContractResolver {
  /**
   * Resolves a ContractId to a ContractInstance.
   *
   * CR-01: Exactly one Contract ID per request.
   * CR-R2: UNRESOLVED/DEFERRED → Contract Resolution Failure.
   * FAIL-03: Resolution failure → No Decision, No Error Code.
   *
   * @param contractId - The Contract ID to resolve.
   * @returns ContractInstance (if ACTIVE) or ResolutionFailure.
   */
  async resolveContract(
    contractId: ContractId,
  ): Promise<ContractInstance | ResolutionFailure> {
    // Step 1: Look up the contract in the registry.
    const registryEntry = CONTRACT_REGISTRY.find(
      (entry) => entry.contractId === contractId,
    );

    // CR-R3: Type-valid ≠ Registry-resolved.
    if (!registryEntry) {
      // CR-R1: This is a runtime registry failure, not typed invalid input.
      // PIP-04: MUST NOT map to NOT_AUTHORIZED.
      return {
        failureType: 'CONTRACT_NOT_FOUND',
        diagnosticMessage:
          `Contract '${contractId}' not found in Contract Registry. ` +
          `This is a developer error (ECB-02 violation or typo).`,
      };
    }

    // Step 2: Check contract status.
    // CR-R2: UNRESOLVED → Contract Resolution Failure.
    if (registryEntry.status === 'UNRESOLVED') {
      // ENG-07: UNRESOLVED contracts are NEVER evaluated.
      // SA-A1: MUST NOT be converted by inference.
      // Part 4 §2: NO inferred ALLOW/DENY/permission/RLS/enforcement.
      return {
        failureType: 'CONTRACT_UNRESOLVED',
        diagnosticMessage:
          `Contract '${contractId}' is UNRESOLVED (A-1 boundary). ` +
          `No enforcement, no RLS, no inferred behavior. ` +
          `Requires formal change-management to resolve.`,
      };
    }

    // CR-R2: DEFERRED → Contract Resolution Failure.
    if (registryEntry.status === 'DEFERRED') {
      return {
        failureType: 'CONTRACT_DEFERRED',
        diagnosticMessage:
          `Contract '${contractId}' is DEFERRED. ` +
          `Cannot be evaluated until formally activated.`,
      };
    }

    // Step 3: Contract is ACTIVE. Produce ContractInstance.
    // CR-R3: Registry-resolved + ACTIVE. But ALLOW is still NOT determined
    // here — only the Engine can produce ALLOW.
    if (!registryEntry.dimensions) {
      // Defensive: ACTIVE contract should have dimensions.
      // If not, this is a registry integrity violation.
      return {
        failureType: 'CONTRACT_NOT_FOUND',
        diagnosticMessage:
          `Contract '${contractId}' is ACTIVE but has no dimensions. ` +
          `This is a registry integrity violation.`,
      };
    }

    return {
      contractId: registryEntry.contractId,
      permissionId: registryEntry.permissionId,
      status: 'ACTIVE',
      dimensions: registryEntry.dimensions,
    };
  }
}
