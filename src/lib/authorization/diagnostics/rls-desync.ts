/**
 * src/lib/authorization/diagnostics/rls-desync.ts
 *
 * RLS Desync Detection — Gate 3 Step 4 §5.
 *
 * RLS-08: RLS rejection after Engine approval = Internal Diagnostic Event,
 *         NOT Authorization Error Code.
 *
 * This is NOT an authorization decision. It is an operational diagnostic
 * that indicates a policy desync between the Engine (L2–L6) and RLS (L7).
 *
 * PIP-04: MUST NOT map to NOT_AUTHORIZED.
 * This is logged as a diagnostic event, not returned as an authorization error.
 */

import type { ContractId } from '../types/contract.types';

export interface RlsDesyncEvent {
  readonly eventType: 'RLS_DESYNC_AFTER_ENGINE_APPROVAL';
  readonly contractId: ContractId;
  readonly entityId: string;
  readonly entityType: string;
  readonly rlsErrorCode: string;
  readonly rlsErrorMessage: string;
  readonly userId: string;
  readonly activeContextId: string;
  readonly effectiveSystemRole: string;
  readonly timestamp: string;
  readonly severity: 'CRITICAL';
}

/**
 * Records an RLS desync event.
 *
 * This function is called when a Supabase mutation fails with an RLS
 * error AFTER the Engine returned ALLOW. This indicates that the RLS
 * policy is more restrictive than the Engine's evaluation, which is
 * a policy desync.
 *
 * RLS-08: This is a Diagnostic Event, NOT an Authorization Error.
 * The Server Action should throw InternalDiagnosticError, not AuthorizationError.
 *
 * @param event - The RLS desync event data.
 */
export function recordRlsDesyncEvent(event: RlsDesyncEvent): void {
  // Log to internal diagnostic system (e.g., sys_transaction_logs, Sentry).
  // This is NOT an authorization decision — it's an operational alert.
  console.error('[RLS_DESYNC]', JSON.stringify(event, null, 2));

  // In production, this would write to a diagnostic table or monitoring system.
  // Example: await supabase.from('sys_transaction_logs').insert(event);
}

/**
 * Determines if a Supabase error is an RLS rejection.
 *
 * Supabase RLS errors typically have error code '42501' (insufficient_privilege)
 * or a message containing "new row violates row-level security policy".
 *
 * @param error - The Supabase error object.
 * @returns true if the error is an RLS rejection.
 */
export function isRlsRejection(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === '42501') return true;
  if (error.message?.includes('row-level security')) return true;
  if (error.message?.includes('RLS')) return true;
  return false;
}
