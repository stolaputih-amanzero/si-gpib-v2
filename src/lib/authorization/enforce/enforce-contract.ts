/**
 * src/lib/authorization/enforce/enforce-contract.ts
 *
 * enforceContract() — The Policy Enforcement Point (PEP) Orchestrator.
 *
 * This is the SINGLE enforcement entry point for all protected Server Actions.
 * It orchestrates the complete authorization pipeline:
 *   Resolver (Gate 1B) → Engine (Gate 1C) → Session Variables (L7 prep).
 *
 * Ontological authority:
 *   - Gate 1D: enforceContract() + Server Action Enforcement v1.0 (FROZEN)
 *   - Part 3 v1.1: Server Action Enforcement
 *   - Part 1 v1.3: Core Authorization Engine & Context Resolver
 *   - Implementation Contract v1.1: EC-01–06, OPI-01–04, ERR-R1–R4, DEC-R1–R5
 *
 * SA-01: Server Action is enforcement boundary, not authorization authority.
 * SA-02: Every protected Server Action has explicit Contract ID.
 * SA-03: No Semantic Shadow Authorization.
 * SA-04: ALLOW is necessary but not sufficient (L7 RLS still applies).
 * SA-05: DENY is hard execution stop.
 * SA-06: Transaction is execution mechanism, not authorization mechanism.
 * SA-07: Layer 8 audit only after successful mutation.
 * SA-08: One Contract → One Traceability Identity per execution path.
 * SA-09: Contract Binding Integrity.
 * SA-A1: Unresolved Contract MUST NOT be converted by inference.
 *
 * ECB-01: Every execution path resolves to exactly one Contract Instance.
 * ECB-02: Contract ID MUST NOT be determined dynamically.
 * ECB-03: Multi-path Server Action: each path has its own Contract.
 * EB-06: Execution-time validation = technical integrity ONLY.
 *
 * CR-01: Every request MUST reference exactly one Contract ID.
 * CR-02: Invalid/unresolvable Contract → NO Authorization Decision.
 * CR-03: UNRESOLVED contracts → NOT evaluated.
 * CR-R1: Contract Resolution Failure = runtime registry failure.
 * CR-R2: UNRESOLVED/DEFERRED → Contract Resolution Failure.
 * CR-R3: Type-valid ContractId ≠ Registry-resolved ≠ ACTIVE ≠ ALLOW.
 *
 * FAIL-01: Engine MUST NOT produce ALLOW if dimension cannot be evaluated.
 * FAIL-02: No ActiveContextObject → No Engine Decision.
 * FAIL-03: Contract resolution failure → No Decision, No Error Code.
 *
 * R-15: Context Resolution Failure ≠ L3 INVALID_CONTEXT.
 *
 * SV-01: Session variables set by server-side, not client.
 * SV-05/SV-06/SV-07/SV-08: Server-validated values.
 * SV-09: Scoped to request/transaction boundary.
 * SV-10: Connection pooling MUST NOT carry stale authorization state.
 *
 * PIP-04: Contract Resolution Failure MUST NOT map to NOT_AUTHORIZED.
 * PIP-08: MUST NOT re-evaluate L2–L6 after ALLOW.
 * PIP-09: Authorization predicate MUST NOT be in transaction body.
 * PIP-14: Dynamic Contract ID from user input is PROHIBITED.
 * PIP-15: C/D/E items MUST NOT be placed in enforceContract().
 * PIP-16: UNRESOLVED/DEFERRED MUST NOT be changed via implementation.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  ContractId,
  OperationInput,
} from '../types/contract.types';
import type {
  EnforcementResult,
  SessionContext,
} from '../types/decision.types';

import { evaluateContract } from '../engine/authorization-engine';
import type { EvaluationInput } from '../engine/evaluation.types';
import { isResolutionFailure } from '../engine/resolver.types';

import { InMemoryContractResolver } from '../engine/contract-resolver';
import { SupabaseIdentityResolver } from '../engine/identity-resolver';
import { SupabaseContextResolver } from '../engine/context-resolver';
import { SupabaseRoleBindingResolver } from '../engine/role-binding-resolver';

/**
 * enforceContract() — The single enforcement entry point.
 *
 * This function orchestrates the complete authorization pipeline:
 *   Step 1: Contract Resolution     (Gate 1B — IContractResolver)
 *   Step 2: Identity Resolution     (Gate 1B — IIdentityResolver)
 *   Step 3: Context Resolution      (Gate 1B — IContextResolver)
 *   Step 4: Role Binding Resolution (Gate 1B — IRoleBindingResolver)
 *   Step 5: Engine Evaluation       (Gate 1C — evaluateContract)
 *   Step 6: Session Variable Setup  (L7 preparation)
 *
 * AUTH-04: Fixed Evaluation Order is enforced by the Engine (Step 5).
 * AUTH-05: Binary Decision (ALLOW or DENY) is produced by the Engine.
 * PIPE-02: Short-circuit is handled by the Engine.
 *
 * This function NEVER throws. It always returns an EnforcementResult.
 * The calling Server Action is responsible for interpreting the result
 * and throwing AuthorizationError or InternalDiagnosticError as needed.
 *
 * EC-01: enforceContract is the ONLY authorization entry point.
 * EC-02: enforceContract MUST NOT be bypassed.
 * EC-03: enforceContract MUST NOT be called within a transaction body.
 * EC-04: enforceContract MUST NOT mutate state.
 * EC-05: enforceContract MUST NOT produce side effects beyond session setup.
 * EC-06: enforceContract MUST return a complete EnforcementResult.
 *
 * @param contractId     - Static, compile-time Contract ID (ECB-02, PIP-14).
 * @param operationInput - Target entity state for L4/L5/L6 (OPI-01–04).
 * @param supabase       - Server-side Supabase client (SV-01: server-side only).
 * @param userId         - Authenticated User Account ID (from session).
 * @param claimedContextId - Client's claimed Active Context ID (AUTH-02: CLAIM).
 * @returns EnforcementResult (ALLOW | DENY | RESOLUTION_FAILURE).
 */
export async function enforceContract(
  contractId: ContractId,
  operationInput: OperationInput,
  supabase: SupabaseClient,
  userId: string,
  claimedContextId: string,
): Promise<EnforcementResult> {
  try {
    // ═══════════════════════════════════════════════════════════
    // STEP 1: CONTRACT RESOLUTION
    // CR-01: Exactly one Contract ID.
    // CR-R2: UNRESOLVED/DEFERRED → Contract Resolution Failure.
    // CR-R3: Type-valid ≠ Registry-resolved ≠ ACTIVE ≠ ALLOW.
    // SA-A1: Unresolved Contract MUST NOT be converted by inference.
    // ═══════════════════════════════════════════════════════════
    const contractResolver = new InMemoryContractResolver();
    const contractResult = await contractResolver.resolveContract(contractId);

    if (isResolutionFailure(contractResult)) {
      // FAIL-03: Contract resolution failure → No Decision, No Error Code.
      // PIP-04: MUST NOT map to NOT_AUTHORIZED.
      return {
        status: 'RESOLUTION_FAILURE',
        failureType: contractResult.failureType,
        diagnosticMessage: contractResult.diagnosticMessage,
      };
    }

    const contract = contractResult;

    // ═══════════════════════════════════════════════════════════
    // STEP 2: IDENTITY RESOLUTION
    // Part 1 v1.3 §2: Identity Resolution Sequence — Step 2.
    // PR-04: Person ≠ User Account.
    // AD-G3-02-07: users.role is NOT ontological truth.
    // ═══════════════════════════════════════════════════════════
    const identityResolver = new SupabaseIdentityResolver(supabase);
    const identity = await identityResolver.resolveBaseIdentity(userId);

    if (!identity) {
      // FAIL-02: No identity → No Engine Decision.
      return {
        status: 'RESOLUTION_FAILURE',
        failureType: 'IDENTITY_NOT_FOUND',
        diagnosticMessage:
          `User identity '${userId}' not found. ` +
          `Session may be invalidated or user account deleted.`,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 3: CONTEXT RESOLUTION
    // Part 1 v1.3 §2: Identity Resolution Sequence — Step 3.
    // AUTH-02: Client Context = CLAIM; Server Resolution = TRUSTED.
    // AC-01: ActiveContextObject is SERVER-VALIDATED.
    // VC-03: Session State ≠ Security Authority.
    // R-15: Context Resolution Failure ≠ L3 INVALID_CONTEXT.
    // ═══════════════════════════════════════════════════════════
    const contextResolver = new SupabaseContextResolver(supabase);
    const contextResult = await contextResolver.resolveActiveContext(
      userId,
      claimedContextId,
    );

    if (isResolutionFailure(contextResult)) {
      // FAIL-02: No ActiveContextObject → No Engine Decision.
      // R-15: This is a Context Resolution Failure, NOT L3 INVALID_CONTEXT.
      return {
        status: 'RESOLUTION_FAILURE',
        failureType: contextResult.failureType,
        diagnosticMessage: contextResult.diagnosticMessage,
      };
    }

    const activeContext = contextResult;

    // ═══════════════════════════════════════════════════════════
    // STEP 4: ROLE BINDING RESOLUTION
    // Part 1 v1.3 §2: Identity Resolution Sequence — Step 4.
    // ID-04: effective_system_role is SINGLE SOURCE for system role.
    // AD-G3-02-02: No Direct Role Equivalence.
    // AD-G3-02-05: Authorization Is Contextual.
    // CI-G3-02-03: Effective Role is contextual.
    // ═══════════════════════════════════════════════════════════
    const roleBindingResolver = new SupabaseRoleBindingResolver(supabase);
    const roleResult = await roleBindingResolver.resolveRoleBinding(
      userId,
      activeContext,
    );

    if (isResolutionFailure(roleResult)) {
      return {
        status: 'RESOLUTION_FAILURE',
        failureType: roleResult.failureType,
        diagnosticMessage: roleResult.diagnosticMessage,
      };
    }

    const roleBinding = roleResult;

    // ═══════════════════════════════════════════════════════════
    // STEP 5: AUTHORIZATION EVALUATION (Engine — Gate 1C)
    // AUTH-04: Fixed Evaluation Order (L2 → L6).
    // AUTH-05: Binary Decision (ALLOW or DENY).
    // AUTH-07: Diagnostic Separation.
    // PIPE-02: Sequential, short-circuit (handled by Engine).
    // PIPE-06: NOT APPLICABLE ≠ skipped (handled by Engine).
    // ENG-01/02/03: Engine is pure, stateless, no DB calls.
    // ═══════════════════════════════════════════════════════════
    const evaluationInput: EvaluationInput = {
      identity,
      activeContext,
      roleBinding,
      contract,
      targetEntity: operationInput.targetEntity,
      preconditionContext: operationInput.preconditionContext,
    };

    const engineOutput = evaluateContract(evaluationInput);

    if (engineOutput.decision.decision === 'DENY') {
      // SA-05: DENY is hard execution stop.
      // ERR-R1: Authorization errors propagate as FrozenErrorCodes.
      // R-10: errorDetail is human-readable, NOT machine-readable.
      // R-11: evaluatedDimensions is separate diagnostic artifact.
      return {
        status: 'DENY',
        errorCode: engineOutput.decision.errorCode!,
        errorDetail: engineOutput.decision.errorDetail ?? 'Authorization denied.',
        evaluatedDimensions: engineOutput.evaluatedDimensions,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 6: SESSION VARIABLE SETUP (L7 Preparation)
    // SV-01: Set by server-side, not client.
    // SV-05: app.active_context_id is server-validated.
    // SV-06: app.effective_system_role from server-side Role Binding.
    // SV-07: app.active_context_id from server-side Context Resolution.
    // SV-08: app.linked_person_id from server-side Identity Resolution.
    // SV-09: Scoped to request/transaction boundary.
    // SV-10: Connection pooling MUST NOT carry stale authorization state.
    // ═══════════════════════════════════════════════════════════
    const sessionContext: SessionContext = {
      userId,
      linkedPersonId: identity.personId,
      activeContextId: activeContext.contextId,
      activeContextLevel: activeContext.contextLevel,
      effectiveSystemRole: roleBinding.effectiveSystemRole,
      assignmentId: roleBinding.assignmentId,
    };

    const sessionSetupResult = await setAuthorizationSessionVariables(
      supabase,
      sessionContext,
    );

    if (!sessionSetupResult.success) {
      // Technical failure during session setup.
      // This is NOT an authorization denial — it's an infrastructure issue.
      // However, without session variables, L7 RLS cannot function correctly.
      // Fail-closed: treat as resolution failure.
      return {
        status: 'RESOLUTION_FAILURE',
        failureType: 'ROLE_BINDING_FAILED',
        diagnosticMessage:
          `Failed to set authorization session variables: ` +
          `${sessionSetupResult.errorMessage}. ` +
          `L7 RLS safety net cannot be guaranteed. Fail-closed.`,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // RETURN: ALLOW
    // SA-04: ALLOW is necessary but not sufficient.
    //        L7 RLS still applies during mutation.
    // SA-06: Transaction is execution mechanism, not authorization.
    // PIP-08: MUST NOT re-evaluate L2–L6 after ALLOW.
    // ═══════════════════════════════════════════════════════════
    return {
      status: 'ALLOW',
      sessionContext,
      evaluatedDimensions: engineOutput.evaluatedDimensions,
    };
  } catch (unexpectedError) {
    // ERR-R3: Technical errors propagate as SystemError.
    // FAIL-03: Unexpected failures → No Decision, No Error Code.
    // This catch block handles truly unexpected errors (DB crash, etc.)
    // that are not part of the normal resolution flow.
    const message =
      unexpectedError instanceof Error
        ? unexpectedError.message
        : 'Unknown error during enforcement';

    return {
      status: 'RESOLUTION_FAILURE',
      failureType: 'CONTRACT_NOT_FOUND', // Generic failure type
      diagnosticMessage:
        `Unexpected error during enforceContract execution: ${message}. ` +
        `This is a technical failure, not an authorization decision.`,
    };
  }
}

/**
 * Sets Supabase session variables for L7 RLS evaluation.
 *
 * SV-01: Set by server-side, not client.
 * SV-02: Input for RLS, not authorization decision.
 * SV-03: Read declaratively via helper functions.
 * SV-04: MUST NOT be set by client-side code.
 * SV-09: Scoped to request/transaction boundary.
 * SV-10: Connection pooling MUST NOT carry stale authorization state.
 *
 * This calls the frozen helper: set_authorization_context (HF registry).
 * The RPC sets all session variables in a single atomic call.
 *
 * @param supabase - Server-side Supabase client.
 * @param ctx      - The session context to set.
 * @returns Success status and error message if failed.
 */
async function setAuthorizationSessionVariables(
  supabase: SupabaseClient,
  ctx: SessionContext,
): Promise<{ success: boolean; errorMessage?: string }> {
  try {
    // Call the frozen helper: set_authorization_context
    // This sets all session variables in a single RPC call:
    //   app.user_id              (SV-03, HF-03)
    //   app.linked_person_id     (SV-08, HF-04)
    //   app.active_context_id    (SV-05, SV-07, HF-01)
    //   app.active_context_level (SV-05, HF-02)
    //   app.effective_system_role(SV-06, HF-05)
    //   app.assignment_id        (for SA-08 traceability)
    const { error } = await supabase.rpc('set_authorization_context', {
      p_user_id: ctx.userId,
      p_linked_person_id: ctx.linkedPersonId,
      p_active_context_id: ctx.activeContextId,
      p_active_context_level: ctx.activeContextLevel,
      p_effective_system_role: ctx.effectiveSystemRole,
      p_assignment_id: ctx.assignmentId,
    });

    if (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }

    return { success: true };
  } catch (rpcError) {
    const message =
      rpcError instanceof Error ? rpcError.message : 'Unknown RPC error';
    return {
      success: false,
      errorMessage: message,
    };
  }
}
