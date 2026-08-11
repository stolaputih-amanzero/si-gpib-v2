import { createHash } from 'crypto';

export type AuditActorType = 'HUMAN' | 'SERVICE' | 'SYSTEM' | 'CRON';

export interface AuditActorContext {
  actor_id: string;
  actor_type: AuditActorType;
  org_context_id: string;
  session_id?: string;
}

export interface AuditAuthorizationProvenance {
  policy_id: string | null;
  policy_version: string;
  decision: 'ALLOW' | 'DENY';
  reason_code: string;
  granted_scope?: string;
}

export interface AuditEntityProvenance {
  entity_type: string;
  entity_id: string;
  action: string;
}

export interface AuditStateMutationDiff {
  state_before: Record<string, unknown> | null;
  state_after: Record<string, unknown> | null;
  changed_fields: string[];
}

export interface AuditCorrelationContext {
  request_id: string;
  transaction_id: string;
  correlation_id: string;
}

export interface AuditChainMetadata {
  sequence_number: number;
  prev_hash: string;
  curr_hash: string;
  occurred_at: string;
}

export interface AuditEventPayload {
  log_id: string;
  topic: string;
  actor: AuditActorContext;
  authorization: AuditAuthorizationProvenance;
  entity: AuditEntityProvenance;
  mutation: AuditStateMutationDiff;
  correlation: AuditCorrelationContext;
  chain: AuditChainMetadata;
}

export interface AuditChainVerificationResult {
  topic: string;
  is_valid: boolean;
  total_records: number;
  verified_at: string;
  failed_at_sequence?: number;
  failure_reason?: string;
}

/**
 * Computes a deterministic SHA-256 canonical hash of the audit entry.
 * Keys are deterministically sorted to prevent serialization mismatch.
 */
export function computeCanonicalAuditHash(input: {
  log_id: string;
  topic: string;
  sequence_number: number;
  prev_hash: string;
  occurred_at: string;
  actor: AuditActorContext;
  authorization: AuditAuthorizationProvenance;
  entity: AuditEntityProvenance;
  mutation: AuditStateMutationDiff;
  correlation: AuditCorrelationContext;
}): string {
  const canonicalObj = {
    log_id: input.log_id,
    topic: input.topic,
    sequence_number: input.sequence_number,
    prev_hash: input.prev_hash,
    occurred_at: input.occurred_at,
    actor: {
      actor_id: input.actor.actor_id,
      actor_type: input.actor.actor_type,
      org_context_id: input.actor.org_context_id,
      session_id: input.actor.session_id || ''
    },
    authorization: {
      policy_id: input.authorization.policy_id || '',
      policy_version: input.authorization.policy_version,
      decision: input.authorization.decision,
      reason_code: input.authorization.reason_code,
      granted_scope: input.authorization.granted_scope || ''
    },
    entity: {
      entity_type: input.entity.entity_type,
      entity_id: input.entity.entity_id,
      action: input.entity.action
    },
    mutation: {
      state_before: input.mutation.state_before ? JSON.stringify(input.mutation.state_before) : null,
      state_after: input.mutation.state_after ? JSON.stringify(input.mutation.state_after) : null,
      changed_fields: [...input.mutation.changed_fields].sort()
    },
    correlation: {
      request_id: input.correlation.request_id,
      transaction_id: input.correlation.transaction_id,
      correlation_id: input.correlation.correlation_id
    }
  };

  const canonicalString = JSON.stringify(canonicalObj, Object.keys(canonicalObj).sort());
  return createHash('sha256').update(canonicalString).digest('hex');
}
