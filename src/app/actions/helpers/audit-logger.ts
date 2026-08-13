/**
 * src/app/actions/helpers/audit-logger.ts
 *
 * L8 — Successful Operation Audit.
 *
 * SA-07: Layer 8 audit only after successful mutation.
 * AUD-06: Transactional audit only after successful commit.
 * PIP-10: Audit before successful commit is PROHIBITED.
 * SA-08: One Contract → One Traceability Identity per execution path.
 *
 * This helper writes audit events to t_log_aktivitas (Audit Trail).
 * It is called ONLY after the mutation has been successfully committed.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import type { ContractId, EvaluatedDimensions, ContextLevel } from '@/lib/authorization';

/**
 * Audit event data for L8 logging.
 */
export interface AuditEventData {
  contractId: ContractId;
  permissionId: string;
  userId: string;
  personId: string | null;
  action: string;
  entityId: string;
  entityType: string;
  contextId: string;
  contextLevel: ContextLevel;
  evaluatedDimensions: EvaluatedDimensions;
  timestamp: string;
}

/**
 * Logs an audit event to t_log_aktivitas.
 *
 * SA-07: Called ONLY after successful mutation.
 * AUD-06: Called ONLY after successful commit.
 * PIP-10: MUST NOT be called before commit.
 * SA-08: Each audit event has exactly one Contract ID.
 *
 * This function does NOT throw on failure. Audit failure is logged
 * as a diagnostic event but does not block the mutation.
 *
 * @param event - The audit event data.
 */
export async function logAuditEvent(event: AuditEventData): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('t_log_aktivitas').insert({
    contract_id: event.contractId,
    permission_id: event.permissionId,
    user_id: event.userId,
    person_id: event.personId,
    action: event.action,
    entity_id: event.entityId,
    entity_type: event.entityType,
    context_id: event.contextId,
    context_level: event.contextLevel,
    evaluated_dimensions: JSON.stringify(event.evaluatedDimensions),
    timestamp: event.timestamp,
    created_at: new Date().toISOString(),
  });

  if (error) {
    // Audit failure is NOT an authorization failure.
    // Log as diagnostic event, but do not block the mutation.
    console.error('[AUDIT_WRITE_FAILURE]', {
      contractId: event.contractId,
      entityId: event.entityId,
      error: error.message,
    });
    // In production, this would write to sys_transaction_logs or Sentry.
  }
}
