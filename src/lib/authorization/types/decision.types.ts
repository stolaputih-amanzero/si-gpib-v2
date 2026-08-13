/**
 * src/lib/authorization/types/decision.types.ts
 *
 * Authorization decision & enforcement result types.
 *
 * Ontological authority:
 *   - Part 1 v1.3 §4 Decision Model
 *   - Part 1 v1.3 §5 Fail-Closed
 *   - Part 3 v1.1 SA-04, SA-05
 *   - Gate 1D Enforcement Specification v1.0
 *
 * AUTH-05: Binary Decision (ALLOW or DENY only).
 * R-11: evaluated_dimensions is a SEPARATE diagnostic artifact,
 *       NOT part of AuthorizationDecision.
 * R-10: error_detail is human-readable, NOT machine-readable.
 */

import type { FrozenErrorCode } from './error.types';
import type { ContextLevel, SystemRole } from './identity.types';

/** Binary dimension evaluation status. NOT_APPLICABLE ≠ skipped (PIPE-06). */
export type DimensionStatus = 'ALLOW' | 'DENY' | 'NOT_APPLICABLE';

/** A single pipeline dimension identifier. */
export type DimensionId = 'L2' | 'L3' | 'L4' | 'L5' | 'L6';

/**
 * Result of evaluating a single dimension.
 *
 * FAIL-01: Engine MUST NOT produce ALLOW if a dimension cannot be evaluated.
 */
export interface DimensionResult {
  readonly dimension: DimensionId;
  readonly status: DimensionStatus;
  /** Present only when status === 'DENY'. One of the 5 Frozen Error Codes. */
  readonly errorCode?: FrozenErrorCode;
  /** Human-readable diagnostic (R-10). NOT machine-readable. */
  readonly diagnosticMessage?: string;
}

/**
 * Diagnostic artifact capturing all evaluated dimensions.
 *
 * R-11: This is SEPARATE from AuthorizationDecision. It is used for
 * L8 audit trail and debugging, never for the authorization decision itself.
 */
export interface EvaluatedDimensions {
  readonly L2: DimensionResult;
  readonly L3: DimensionResult;
  readonly L4: DimensionResult;
  readonly L5: DimensionResult;
  readonly L6: DimensionResult;
}

/**
 * Authorization Decision — the binary output of the Engine.
 *
 * AUTH-05: Binary Decision. Only ALLOW or DENY. No PARTIAL, no MAYBE.
 * DEC-R1–R5: Decision model rules.
 */
export interface AuthorizationDecision {
  readonly decision: 'ALLOW' | 'DENY';
  /** Present only when decision === 'DENY'. */
  readonly errorCode?: FrozenErrorCode;
  /** Human-readable detail (R-10). Present only when decision === 'DENY'. */
  readonly errorDetail?: string;
}

/** Complete Engine output: decision + diagnostic artifact. */
export interface EngineOutput {
  readonly decision: AuthorizationDecision;
  readonly evaluatedDimensions: EvaluatedDimensions;
}

/**
 * Session Context — produced by enforceContract() on ALLOW.
 *
 * Used to set Supabase session variables for L7 RLS evaluation.
 * SV-01: Set by server-side, not client.
 * SV-05/SV-06/SV-08: Server-validated values.
 */
export interface SessionContext {
  readonly userId: string;
  readonly linkedPersonId: string | null;
  readonly activeContextId: string;
  readonly activeContextLevel: ContextLevel;
  readonly effectiveSystemRole: SystemRole;
  readonly assignmentId: string;
}

/**
 * Resolution Failure — runtime registry / PIP failure.
 *
 * CR-R1: Contract Resolution Failure = runtime registry failure,
 *        NOT typed invalid input.
 * FAIL-03: Contract resolution failure → No Decision, No Error Code.
 * R-15: Context Resolution Failure ≠ L3 INVALID_CONTEXT.
 * PIP-04: MUST NOT map to NOT_AUTHORIZED.
 */
export type ResolutionFailureType =
  | 'IDENTITY_NOT_FOUND'
  | 'CONTEXT_CLAIM_INVALID'
  | 'CONTEXT_NOT_FOUND'
  | 'ROLE_BINDING_FAILED'
  | 'CONTRACT_NOT_FOUND'
  | 'CONTRACT_UNRESOLVED'
  | 'CONTRACT_DEFERRED';

/**
 * Enforcement Result — Discriminated Union returned by enforceContract().
 *
 * Type-driven safety: consumers MUST narrow on `status` before accessing
 * status-specific fields (Poka-yoke via TypeScript).
 *
 * SA-04: ALLOW is necessary but not sufficient (L7 RLS still applies).
 * SA-05: DENY is hard execution stop.
 * FAIL-03: RESOLUTION_FAILURE carries No Decision, No Error Code.
 */
export type EnforcementResult =
  | EnforcementAllow
  | EnforcementDeny
  | EnforcementResolutionFailure;

export interface EnforcementAllow {
  readonly status: 'ALLOW';
  readonly sessionContext: SessionContext;
  readonly evaluatedDimensions: EvaluatedDimensions;
}

export interface EnforcementDeny {
  readonly status: 'DENY';
  readonly errorCode: FrozenErrorCode;
  readonly errorDetail: string;
  readonly evaluatedDimensions: EvaluatedDimensions;
}

export interface EnforcementResolutionFailure {
  readonly status: 'RESOLUTION_FAILURE';
  readonly failureType: ResolutionFailureType;
  readonly diagnosticMessage: string;
}
