import { TelemetryTopic, TelemetryEventType } from '@/types/telemetryStream.types';

export type ConnectionStatusLabel = 
  | 'DISCONNECTED' 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'RECONNECTING' 
  | 'REPLAYING'
  | 'ERROR';

export interface TelemetryEventViewModel {
  event_id: string;
  idempotency_key: string;
  sequence_number: number;
  sequenceFormatted: string;
  event_type: TelemetryEventType;
  typeLabel: string;
  typeBadgeColor: string;
  occurredFormatted: string;
  title: string;
  detailText: string;
  progressPercent: number | null;
  progressFormatted: string | null;
  hasError: boolean;
  isReplayed: boolean;
}

export interface TelemetrySummaryMetrics {
  totalEvents: number;
  batchesStarted: number;
  batchesCompleted: number;
  rowsProcessed: number;
  rowsFailed: number;
  failureRatePercent: number;
  failureRateFormatted: string;
}

export interface TelemetryConnectionViewModel {
  state: ConnectionStatusLabel;
  stateLabel: string;
  badgeColor: string;
  lastSequence: number;
}

export interface TelemetryReplayViewModel {
  hasMore: boolean;
  nextSequence: number;
  isReplaying: boolean;
}

export interface TelemetryWorkspaceViewModel {
  topic: TelemetryTopic;
  topicLabel: string;
  connection: TelemetryConnectionViewModel;
  metrics: TelemetrySummaryMetrics;
  events: TelemetryEventViewModel[];
  replay: TelemetryReplayViewModel;
  hasEvents: boolean;
}
