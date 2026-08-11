import { createHmac } from 'crypto';

export type WebhookDeliveryStatus = 
  | 'QUEUED' 
  | 'DELIVERING' 
  | 'DELIVERED' 
  | 'FAILED_RETRYING' 
  | 'DLQ' 
  | 'CANCELLED';

export type WebhookAttemptOutcome = 
  | 'SUCCESS' 
  | 'HTTP_ERROR' 
  | 'TIMEOUT' 
  | 'NETWORK_ERROR';

export type WebhookEventSource = 
  | 'F11_TELEMETRY_OUTBOX' 
  | 'AUDIT_COMPLIANCE' 
  | 'SYSTEM_MUTATION';

export interface WebhookDeliveryPolicy {
  max_retries: number;
  initial_backoff_ms: number;
  max_backoff_ms: number;
  timeout_ms: number;
  accepted_http_codes: number[];
}

export interface WebhookEndpointDefinition {
  endpoint_id: string;
  target_url: string;
  description: string;
  subscribed_events: string[];
  delivery_policy: WebhookDeliveryPolicy;
  is_active: boolean;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookPayloadEnvelope {
  event_id: string;
  topic: string;
  event_type: string;
  source: WebhookEventSource;
  occurred_at: string;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface WebhookDeliveryRecord {
  delivery_id: string;
  endpoint_id: string;
  event_id: string;
  topic: string;
  status: WebhookDeliveryStatus;
  current_attempt: number;
  max_attempts: number;
  next_retry_at?: string;
  idempotency_key: string;
  queued_at: string;
  delivered_at?: string;
  dlq_at?: string;
}

export interface WebhookAttemptLog {
  attempt_id: string;
  delivery_id: string;
  attempt_number: number;
  outcome: WebhookAttemptOutcome;
  http_status_code?: number;
  latency_ms: number;
  response_snippet?: string;
  attempted_at: string;
}

export interface WebhookDLQReplayRequest {
  replay_id: string;
  delivery_id: string;
  replayed_by: string;
  replayed_at: string;
  reason: string;
}

export interface WebhookSignatureContext {
  timestamp: string;
  signature_header: string;
  delivery_id: string;
}

/**
 * Computes deterministic HMAC-SHA256 payload signature for X-GPIB-Signature header.
 * Header Format: t={timestamp},v1={hmac_sha256_hash}
 */
export function computeWebhookHMACSignature(secret: string, timestamp: string, payloadStr: string): string {
  const signedPayload = `${timestamp}.${payloadStr}`;
  const hmac = createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${hmac}`;
}
