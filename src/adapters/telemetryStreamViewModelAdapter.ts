import { 
  UnifiedTelemetryStreamData, 
  TelemetryEvent, 
  TelemetryEventType, 
  ConnectionState 
} from '@/types/telemetryStream.types';
import { 
  TelemetryWorkspaceViewModel, 
  TelemetryEventViewModel, 
  TelemetrySummaryMetrics, 
  ConnectionStatusLabel 
} from '@/types/telemetryStreamViewModel.types';

function getConnectionStateLabel(state: ConnectionState): string {
  switch (state) {
    case 'CONNECTED':
      return 'Terhubung Live Stream';
    case 'CONNECTING':
      return 'Menghubungkan Stream...';
    case 'DISCONNECTED':
      return 'Terputus';
    case 'REPLAYING':
      return 'Memulihkan Replay Sequence...';
    default:
      return 'Status Koneksi Tidak Diketahui';
  }
}

function getConnectionBadgeColor(state: ConnectionState): string {
  switch (state) {
    case 'CONNECTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CONNECTING':
    case 'REPLAYING':
      return 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse';
    case 'DISCONNECTED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function getEventTypeLabel(type: TelemetryEventType): string {
  switch (type) {
    case 'batch.started':
      return 'Batch Dimulai';
    case 'batch.progress':
      return 'Kemajuan Batch';
    case 'row.failed':
      return 'Baris Gagal';
    case 'batch.completed':
      return 'Batch Selesai';
    default:
      return type;
  }
}

function getEventTypeBadgeColor(type: TelemetryEventType): string {
  switch (type) {
    case 'batch.started':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'batch.progress':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'row.failed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'batch.completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function mapEventToViewModel(event: TelemetryEvent, isReplay: boolean = false): TelemetryEventViewModel {
  let title = '';
  let detailText = '';
  let progressPercent: number | null = null;
  let progressFormatted: string | null = null;
  let hasError = false;

  switch (event.event_type) {
    case 'batch.started':
      title = `Memulai Batch ${event.payload.batch_id}`;
      detailText = `Target: ${event.payload.target_entity_type.toUpperCase()} • Total: ${event.payload.total_rows} Baris • Kebijakan: ${event.payload.atomicity_policy}`;
      break;

    case 'batch.progress':
      title = `Kemajuan Batch ${event.payload.batch_id} (Chunk #${event.payload.chunk_index})`;
      progressPercent = event.payload.progress_percent;
      progressFormatted = `${event.payload.progress_percent}%`;
      detailText = `Terproses: ${event.payload.processed_rows} baris • Committed: ${event.payload.committed_rows} baris`;
      break;

    case 'row.failed':
      hasError = true;
      title = `Gagal Pada Baris #${event.payload.row_number} (Batch ${event.payload.batch_id})`;
      detailText = `Kode Error: ${event.payload.error_code} • Pesan: ${event.payload.error_message}`;
      if (event.payload.reconciliation_notes) {
        detailText += ` • Catatan: ${event.payload.reconciliation_notes}`;
      }
      break;

    case 'batch.completed':
      title = `Batch ${event.payload.batch_id} Telah Selesai`;
      detailText = `Total: ${event.payload.total_rows} • Berhasil: ${event.payload.committed_rows} • Gagal: ${event.payload.failed_rows} • Durasi: ${event.payload.duration_ms}ms`;
      break;
  }

  return {
    event_id: event.event_id,
    idempotency_key: event.idempotency_key,
    sequence_number: event.sequence_number,
    sequenceFormatted: `#${event.sequence_number}`,
    event_type: event.event_type,
    typeLabel: getEventTypeLabel(event.event_type),
    typeBadgeColor: getEventTypeBadgeColor(event.event_type),
    occurredFormatted: event.occurred_at ? new Date(event.occurred_at).toLocaleTimeString('id-ID') : '-',
    title,
    detailText,
    progressPercent,
    progressFormatted,
    hasError,
    isReplayed: isReplay
  };
}

export function adaptTelemetryStreamToViewModel(
  data: UnifiedTelemetryStreamData,
  replayEvents: TelemetryEvent[] = []
): TelemetryWorkspaceViewModel {
  // Deduplicate events across live and replay streams via event_id
  const seenEventIds = new Set<string>();
  const uniqueEvents: TelemetryEventViewModel[] = [];

  // Add replay events first
  for (const e of replayEvents) {
    if (!seenEventIds.has(e.event_id)) {
      seenEventIds.add(e.event_id);
      uniqueEvents.push(mapEventToViewModel(e, true));
    }
  }

  // Add live stream events
  for (const e of data.events || []) {
    if (!seenEventIds.has(e.event_id)) {
      seenEventIds.add(e.event_id);
      uniqueEvents.push(mapEventToViewModel(e, false));
    }
  }

  // Sort strictly ascending by sequence_number
  uniqueEvents.sort((a, b) => a.sequence_number - b.sequence_number);

  // Compute Metrics without Inflation from Duplicates
  let batchesStarted = 0;
  let batchesCompleted = 0;
  let rowsProcessed = 0;
  let rowsFailed = 0;

  for (const vm of uniqueEvents) {
    if (vm.event_type === 'batch.started') batchesStarted++;
    if (vm.event_type === 'batch.completed') batchesCompleted++;
    if (vm.event_type === 'row.failed') rowsFailed++;
    if (vm.progressPercent !== null) {
      // Find max progress
    }
  }

  const totalEvents = uniqueEvents.length;
  const failureRatePercent = totalEvents > 0 ? Math.round((rowsFailed / totalEvents) * 100) : 0;

  const metrics: TelemetrySummaryMetrics = {
    totalEvents,
    batchesStarted,
    batchesCompleted,
    rowsProcessed,
    rowsFailed,
    failureRatePercent,
    failureRateFormatted: `${failureRatePercent}%`
  };

  const connState: ConnectionStatusLabel = data.consumer_state?.connection_state as ConnectionStatusLabel || 'DISCONNECTED';

  return {
    topic: data.topic,
    topicLabel: data.topic ? data.topic.toUpperCase().replace(/\./g, ' • ') : 'TELEMETRY STREAM',
    connection: {
      state: connState,
      stateLabel: getConnectionStateLabel(data.consumer_state?.connection_state || 'DISCONNECTED'),
      badgeColor: getConnectionBadgeColor(data.consumer_state?.connection_state || 'DISCONNECTED'),
      lastSequence: data.consumer_state?.last_sequence || 0
    },
    metrics,
    events: uniqueEvents,
    replay: {
      hasMore: false,
      nextSequence: data.consumer_state?.last_sequence || 0,
      isReplaying: data.consumer_state?.connection_state === 'REPLAYING'
    },
    hasEvents: uniqueEvents.length > 0
  };
}
