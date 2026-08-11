export type TelemetryTopic = 
  | 'telemetry.batch_queue' 
  | 'telemetry.system_audit' 
  | 'telemetry.workflow';

export type TelemetryEventType = 
  | 'batch.started' 
  | 'batch.progress' 
  | 'row.failed' 
  | 'batch.completed';

export type TelemetryDeliveryState = 
  | 'PENDING' 
  | 'PUBLISHED' 
  | 'FAILED' 
  | 'RETRYING';

export type ConnectionState = 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'DISCONNECTED' 
  | 'REPLAYING';

export interface BatchStartedPayload {
  batch_id: string;
  target_entity_type: string;
  total_rows: number;
  atomicity_policy: string;
}

export interface BatchProgressPayload {
  batch_id: string;
  chunk_index: number;
  processed_rows: number;
  committed_rows: number;
  progress_percent: number;
}

export interface RowFailedPayload {
  batch_id: string;
  row_number: number;
  error_code: string;
  error_message: string;
  reconciliation_notes: string | null;
}

export interface BatchCompletedPayload {
  batch_id: string;
  total_rows: number;
  committed_rows: number;
  failed_rows: number;
  duration_ms: number;
}

interface BaseTelemetryEvent {
  event_id: string;
  idempotency_key: string;
  topic: TelemetryTopic;
  sequence_number: number;
  occurred_at: string;
  published_at?: string | null;
  delivery_state: TelemetryDeliveryState;
  metadata: Record<string, string | number | boolean>;
}

export interface BatchStartedEvent extends BaseTelemetryEvent {
  event_type: 'batch.started';
  payload: BatchStartedPayload;
}

export interface BatchProgressEvent extends BaseTelemetryEvent {
  event_type: 'batch.progress';
  payload: BatchProgressPayload;
}

export interface RowFailedEvent extends BaseTelemetryEvent {
  event_type: 'row.failed';
  payload: RowFailedPayload;
}

export interface BatchCompletedEvent extends BaseTelemetryEvent {
  event_type: 'batch.completed';
  payload: BatchCompletedPayload;
}

// Discriminated Union for Telemetry Events
export type TelemetryEvent = 
  | BatchStartedEvent 
  | BatchProgressEvent 
  | RowFailedEvent 
  | BatchCompletedEvent;

export interface TelemetryConsumerState {
  last_sequence: number;
  last_event_id: string;
  connection_state: ConnectionState;
}

export interface TelemetryReplayRequest {
  topic: TelemetryTopic;
  after_sequence: number;
  limit?: number;
}

export interface TelemetryReplayResponse {
  events: TelemetryEvent[];
  next_sequence: number;
  has_more: boolean;
}

export interface UnifiedTelemetryStreamData {
  topic: TelemetryTopic;
  consumer_state: TelemetryConsumerState;
  events: TelemetryEvent[];
  unread_failed_count: number;
}

// Helper function validating legal delivery state transitions
export function isValidDeliveryStateTransition(
  current: TelemetryDeliveryState, 
  next: TelemetryDeliveryState
): boolean {
  const allowedTransitions: Record<TelemetryDeliveryState, TelemetryDeliveryState[]> = {
    PENDING: ['PUBLISHED', 'RETRYING', 'FAILED'],
    RETRYING: ['PUBLISHED', 'FAILED'],
    PUBLISHED: [], // Terminal State
    FAILED: ['RETRYING', 'PUBLISHED']
  };

  return allowedTransitions[current]?.includes(next) || false;
}
