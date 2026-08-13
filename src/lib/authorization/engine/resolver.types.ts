/**
 * src/lib/authorization/engine/resolver.types.ts
 *
 * Shared types for the Resolver layer (Gate 1B — Policy Information Point).
 *
 * Ontological authority:
 *   - Gate 1B: Resolver Interfaces v1.0 (FROZEN)
 *   - Part 1 v1.3 §1: Contract Resolution Model
 *   - Part 1 v1.3 §2: Identity Resolution Sequence
 *
 * AUTH-02: Client Context = CLAIM; Server Resolution = TRUSTED RESULT.
 * CR-R1: Contract Resolution Failure = runtime registry failure,
 *        NOT typed invalid input.
 * R-15: Context Resolution Failure ≠ L3 INVALID_CONTEXT.
 * FAIL-03: Resolution failure → No Decision, No Error Code.
 */

import type { ResolutionFailureType } from '../types/decision.types';

/**
 * Resolution Failure — returned by any Resolver when it cannot produce
 * the required DTO.
 *
 * CR-R1: This is a runtime registry/PIP failure, NOT an authorization denial.
 * FAIL-03: Resolution failure carries NO FrozenErrorCode.
 * PIP-04: MUST NOT be mapped to NOT_AUTHORIZED.
 * R-15: Context resolution failure is NOT L3 INVALID_CONTEXT.
 *
 * The orchestrator (Gate 1D enforceContract) translates this into
 * EnforcementResolutionFailure, which is NOT an AuthorizationDecision.
 */
export interface ResolutionFailure {
  readonly failureType: ResolutionFailureType;
  /** Human-readable diagnostic for logging/debugging. NOT machine-readable. */
  readonly diagnosticMessage: string;
}

/**
 * Type guard: determines whether a resolver result is a ResolutionFailure.
 * Used by the orchestrator to branch between success and failure paths.
 */
export function isResolutionFailure<T>(
  result: T | ResolutionFailure,
): result is ResolutionFailure {
  return (
    typeof result === 'object' &&
    result !== null &&
    'failureType' in result &&
    'diagnosticMessage' in result
  );
}
