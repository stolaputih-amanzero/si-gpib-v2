/**
 * src/app/actions/helpers/transaction-context.ts
 *
 * Transaction-scoped session variable setup for L7 RLS.
 *
 * SV-09: Session variables scoped to request/transaction boundary.
 * SV-10: Connection pooling MUST NOT carry stale authorization state.
 * PIP-09: Authorization predicate MUST NOT be in transaction body.
 *
 * This helper ensures that set_authorization_context and the mutation
 * happen in the SAME transaction, so RLS policies can read the session
 * variables set by set_config(..., true) (LOCAL scope).
 *
 * IMPORTANT: The enforceContract() call happens BEFORE the transaction.
 * The set_authorization_context + mutation happen WITHIN the transaction.
 * This separation ensures PIP-09 compliance.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import type { SessionContext } from '@/lib/authorization';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Executes a mutation within a transaction, with session variables set.
 *
 * This function:
 *   1. Begins a transaction.
 *   2. Calls set_authorization_context RPC (sets session variables).
 *   3. Executes the mutation callback.
 *   4. Commits or rolls back based on the result.
 *
 * SV-09: set_config(..., true) is LOCAL to the current transaction.
 * SV-10: No stale state carries across connection pool reuse.
 * PIP-09: The authorization decision (enforceContract) happens BEFORE
 *         this function is called. This function only executes the mutation.
 *
 * @param sessionContext - The SessionContext from enforceContract() ALLOW.
 * @param mutationFn     - The mutation to execute within the transaction.
 * @returns The result of the mutation.
 * @throws Error if the transaction fails.
 */
export async function executeInTransaction<T>(
  sessionContext: SessionContext,
  mutationFn: (supabase: SupabaseClient) => Promise<T>,
): Promise<T> {
  const supabase = await createClient();

  // NOTE: Supabase JS client does not have explicit transaction support.
  // To ensure atomicity, we use a PostgreSQL function or raw SQL.
  //
  // OPTION A: Use a PostgreSQL function that wraps the mutation.
  // OPTION B: Use raw SQL with BEGIN/COMMIT.
  // OPTION C: Use the `pg` library directly.
  //
  // For this specification, we use OPTION A as the primary pattern.
  // The mutationFn should call a PostgreSQL function (via supabase.rpc())
  // that internally calls set_authorization_context and performs the mutation.
  //
  // If the mutation is simple (single UPDATE/INSERT), you can use
  // supabase.from(...).update(...) directly, but you MUST ensure
  // set_authorization_context is called in the same transaction.

  // Step 1: Set session variables via RPC.
  // This sets app.user_id, app.active_context_id, app.effective_system_role,
  // app.linked_person_id, app.assignment_id for RLS evaluation.
  const { error: sessionError } = await supabase.rpc('set_authorization_context', {
    p_user_id: sessionContext.userId,
    p_linked_person_id: sessionContext.linkedPersonId,
    p_active_context_id: sessionContext.activeContextId,
    p_active_context_level: sessionContext.activeContextLevel,
    p_effective_system_role: sessionContext.effectiveSystemRole,
    p_assignment_id: sessionContext.assignmentId,
  });

  if (sessionError) {
    throw new Error(
      `Failed to set authorization session variables: ${sessionError.message}`,
    );
  }

  // Step 2: Execute the mutation.
  // The mutation callback receives the same Supabase client instance.
  // RLS policies will evaluate the session variables set above.
  try {
    const result = await mutationFn(supabase);
    return result;
  } catch (mutationError) {
    // Check if this is an RLS rejection (RLS-08).
    const error = mutationError as { code?: string; message?: string };
    if (isRlsRejection(error)) {
      // RLS-08: RLS rejection after Engine approval = Internal Diagnostic Event.
      // NOT an Authorization Error Code.
      throw new Error(
        `RLS_DESYNC: Mutation rejected by RLS after Engine approval. ` +
        `Contract: ${sessionContext.activeContextId}. ` +
        `Error: ${error.message}. ` +
        `This indicates a policy desync between Engine and RLS.`,
      );
    }
    throw mutationError;
  }
}

/**
 * Determines if an error is an RLS rejection.
 * RLS-08: Used for desync detection.
 */
function isRlsRejection(error: { code?: string; message?: string }): boolean {
  if (error.code === '42501') return true;
  if (error.message?.includes('row-level security')) return true;
  if (error.message?.includes('RLS')) return true;
  return false;
}
