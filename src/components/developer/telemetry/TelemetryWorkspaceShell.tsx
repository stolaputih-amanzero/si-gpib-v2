'use client';

import React, { useState } from 'react';
import { 
  UnifiedTelemetryStreamData, 
  TelemetryEvent 
} from '@/types/telemetryStream.types';
import { adaptTelemetryStreamToViewModel } from '@/adapters/telemetryStreamViewModelAdapter';
import { TelemetryEventViewModel } from '@/types/telemetryStreamViewModel.types';
import { TelemetryHeader } from './TelemetryHeader';
import { TelemetryStreamMetrics } from './TelemetryStreamMetrics';
import { LiveEventFeedPanel } from './LiveEventFeedPanel';
import { EventDetailModal } from './EventDetailModal';

interface TelemetryWorkspaceShellProps {
  initialStreamData?: UnifiedTelemetryStreamData | null;
}

export const TelemetryWorkspaceShell: React.FC<TelemetryWorkspaceShellProps> = ({
  initialStreamData
}) => {
  const [streamData, setStreamData] = useState<UnifiedTelemetryStreamData | null>(initialStreamData || null);
  const [replayEvents, setReplayEvents] = useState<TelemetryEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TelemetryEventViewModel | null>(null);

  // Client-side demo state machine fallback if no RPC data loaded
  const activeStreamData: UnifiedTelemetryStreamData = streamData || {
    topic: 'telemetry.batch_queue',
    consumer_state: {
      last_sequence: 4,
      last_event_id: 'EVT-004',
      connection_state: 'CONNECTED'
    },
    events: [
      {
        event_id: 'EVT-001',
        idempotency_key: 'IDEM-BATCH-200-START',
        topic: 'telemetry.batch_queue',
        event_type: 'batch.started',
        sequence_number: 1,
        occurred_at: new Date(Date.now() - 60000).toISOString(),
        published_at: new Date(Date.now() - 60000).toISOString(),
        delivery_state: 'PUBLISHED',
        metadata: {},
        payload: { batch_id: 'BATCH-200', target_entity_type: 'person', total_rows: 1000, atomicity_policy: 'PARTIAL_ALLOW_VALID' }
      },
      {
        event_id: 'EVT-002',
        idempotency_key: 'IDEM-BATCH-200-PROG-1',
        topic: 'telemetry.batch_queue',
        event_type: 'batch.progress',
        sequence_number: 2,
        occurred_at: new Date(Date.now() - 40000).toISOString(),
        published_at: new Date(Date.now() - 40000).toISOString(),
        delivery_state: 'PUBLISHED',
        metadata: {},
        payload: { batch_id: 'BATCH-200', chunk_index: 1, processed_rows: 100, committed_rows: 99, progress_percent: 10 }
      },
      {
        event_id: 'EVT-003',
        idempotency_key: 'IDEM-BATCH-200-FAIL-1',
        topic: 'telemetry.batch_queue',
        event_type: 'row.failed',
        sequence_number: 3,
        occurred_at: new Date(Date.now() - 35000).toISOString(),
        published_at: new Date(Date.now() - 35000).toISOString(),
        delivery_state: 'PUBLISHED',
        metadata: {},
        payload: { batch_id: 'BATCH-200', row_number: 87, error_code: 'DUPLICATE_MEMBER_ID', error_message: 'Nomor anggota JMT-087 sudah terdaftar', reconciliation_notes: 'Cek data jemaat' }
      },
      {
        event_id: 'EVT-004',
        idempotency_key: 'IDEM-BATCH-200-PROG-2',
        topic: 'telemetry.batch_queue',
        event_type: 'batch.progress',
        sequence_number: 4,
        occurred_at: new Date(Date.now() - 10000).toISOString(),
        published_at: new Date(Date.now() - 10000).toISOString(),
        delivery_state: 'PUBLISHED',
        metadata: {},
        payload: { batch_id: 'BATCH-200', chunk_index: 2, processed_rows: 200, committed_rows: 199, progress_percent: 20 }
      }
    ],
    unread_failed_count: 1
  };

  const vm = adaptTelemetryStreamToViewModel(activeStreamData, replayEvents);

  const handleSimulateDisconnect = () => {
    setStreamData({
      ...activeStreamData,
      consumer_state: {
        ...activeStreamData.consumer_state,
        connection_state: 'DISCONNECTED'
      }
    });
  };

  const handleTriggerReplay = async () => {
    // 1. Transition to REPLAYING
    setStreamData({
      ...activeStreamData,
      consumer_state: {
        ...activeStreamData.consumer_state,
        connection_state: 'REPLAYING'
      }
    });

    // 2. Simulate RPC get_telemetry_event_replay execution after sequence 0
    setTimeout(() => {
      const mockReplay: TelemetryEvent[] = [
        {
          event_id: 'EVT-REPLAY-000',
          idempotency_key: 'IDEM-REPLAY-000',
          topic: 'telemetry.batch_queue',
          event_type: 'batch.started',
          sequence_number: 0,
          occurred_at: new Date(Date.now() - 120000).toISOString(),
          delivery_state: 'PUBLISHED',
          metadata: {},
          payload: { batch_id: 'BATCH-PREV', target_entity_type: 'asset', total_rows: 50, atomicity_policy: 'ALL_OR_NOTHING' }
        }
      ];

      setReplayEvents(mockReplay);

      // 3. Resume CONNECTED state
      setStreamData({
        ...activeStreamData,
        consumer_state: {
          ...activeStreamData.consumer_state,
          connection_state: 'CONNECTED'
        }
      });
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <TelemetryHeader
        vm={vm}
        onSimulateDisconnect={handleSimulateDisconnect}
        onTriggerReplay={handleTriggerReplay}
      />
      <TelemetryStreamMetrics vm={vm} />
      <LiveEventFeedPanel
        events={vm.events}
        onSelectEvent={(evt) => setSelectedEvent(evt)}
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
