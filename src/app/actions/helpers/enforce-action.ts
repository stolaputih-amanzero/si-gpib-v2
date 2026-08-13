/**
 * src/app/actions/helpers/enforce-action.ts
 *
 * Shared enforcement wrapper for Server Actions.
 *
 * SA-01: Server Action is enforcement boundary, not authorization authority.
 * SA-02: Every protected Server Action has explicit Contract ID.
 * SA-05: DENY is hard execution stop.
 * PIP-01: if (user.role === ...) without enforceContract() is PROHIBITED.
 * PIP-02: if (user.id_pos === ...) as authorization is PROHIBITED.
 * PIP-14: Dynamic Contract ID from user input is PROHIBITED.
 *
 * This helper encapsulates the common enforcement flow:
 *   1. Get authenticated user
 *   2. Call enforceContract()
 *   3. Handle ALLOW / DENY / RESOLUTION_FAILURE
 *
 * Server Actions call this helper, then proceed with mutation if ALLOW.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import {
  enforceContract,
  AuthorizationError,
  InternalDiagnosticError,
  type ContractId,
  type OperationInput,
  type EnforcementResult,
  type SessionContext,
} from '@/lib/authorization';

/**
 * Result of the enforcement phase.
 * If status is 'ALLOW', the Server Action can proceed with mutation.
 * If status is 'DENY' or 'RESOLUTION_FAILURE', an error is thrown.
 */
export interface EnforcementOutcome {
  sessionContext: SessionContext;
  userId: string;
}

/**
 * Enforces the authorization contract for a Server Action.
 *
 * This function:
 *   1. Gets the authenticated user from the session.
 *   2. Calls enforceContract() with the given Contract ID.
 *   3. Throws AuthorizationError if DENY (SA-05).
 *   4. Throws InternalDiagnosticError if RESOLUTION_FAILURE (FAIL-03).
 *   5. Returns the SessionContext if ALLOW (SA-04).
 *
 * SA-02: contractId is a STATIC parameter, not derived from user input.
 * ECB-02: Contract ID MUST NOT be determined dynamically.
 *
 * @param contractId     - Static Contract ID (ECB-02, PIP-14).
 * @param operationInput - Target entity state for L4/L5/L6 (OPI-01–04).
 * @param claimedContextId - Client's claimed Active Context ID (AUTH-02).
 * @returns EnforcementOutcome with SessionContext for mutation.
 * @throws AuthorizationError if DENY.
 * @throws InternalDiagnosticError if RESOLUTION_FAILURE.
 * @throws Error if not authenticated.
 */
import { cookies } from 'next/headers';

export async function enforceAction(
  contractId: ContractId,
  operationInput: OperationInput,
  claimedContextId?: string,
): Promise<EnforcementOutcome> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  
  // Use provided context ID, fallback to cookie, fallback to empty (engine handles failure)
  const resolvedContextId = claimedContextId || cookieStore.get('sigpib_active_context')?.value || '';

  // Step 1: Get authenticated user.
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated. Please log in.');
  }

  // Step 2: Call enforceContract().
  // SA-01: Server Action calls enforceContract(), does not define authorization.
  // SA-02: contractId is explicit, not derived from user input.
  const result: EnforcementResult = await enforceContract(
    contractId,
    operationInput,
    supabase,
    user.id,
    resolvedContextId,
  );

  // Step 3: Handle result.
  // SA-05: DENY is hard execution stop.
  if (result.status === 'DENY') {
    // ERR-R1: Authorization errors propagate as FrozenErrorCodes.
    throw new AuthorizationError(result.errorCode, result.errorDetail);
  }

  // FAIL-03: Resolution failure → No Decision, No Error Code.
  // PIP-04: MUST NOT map to NOT_AUTHORIZED.
  if (result.status === 'RESOLUTION_FAILURE') {
    throw new InternalDiagnosticError(result.diagnosticMessage);
  }

  // SA-04: ALLOW is necessary but not sufficient.
  // L7 RLS still applies during mutation.
  return {
    sessionContext: result.sessionContext,
    userId: user.id,
  };
}
