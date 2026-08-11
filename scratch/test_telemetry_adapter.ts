import * as assert from 'assert';
import { UnifiedTelemetryStreamData, TelemetryEvent } from '../src/types/telemetryStream.types';
import { adaptTelemetryStreamToViewModel } from '../src/adapters/telemetryStreamViewModelAdapter';

function runTelemetryAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptTelemetryStreamToViewModel...\n");

  const evt1: TelemetryEvent = {
    event_id: 'EVT-001',
    idempotency_key: 'IDEM-001',
    topic: 'telemetry.batch_queue',
    event_type: 'batch.started',
    sequence_number: 1,
    occurred_at: '2026-08-01T10:00:00Z',
    delivery_state: 'PUBLISHED',
    metadata: {},
    payload: { batch_id: 'B-100', target_entity_type: 'person', total_rows: 500, atomicity_policy: 'ALL_OR_NOTHING' }
  };

  const evt2: TelemetryEvent = {
    event_id: 'EVT-002',
    idempotency_key: 'IDEM-002',
    topic: 'telemetry.batch_queue',
    event_type: 'batch.progress',
    sequence_number: 2,
    occurred_at: '2026-08-01T10:00:01Z',
    delivery_state: 'PUBLISHED',
    metadata: {},
    payload: { batch_id: 'B-100', chunk_index: 1, processed_rows: 100, committed_rows: 100, progress_percent: 20 }
  };

  const evt3: TelemetryEvent = {
    event_id: 'EVT-003',
    idempotency_key: 'IDEM-003',
    topic: 'telemetry.batch_queue',
    event_type: 'row.failed',
    sequence_number: 3,
    occurred_at: '2026-08-01T10:00:02Z',
    delivery_state: 'PUBLISHED',
    metadata: {},
    payload: { batch_id: 'B-100', row_number: 12, error_code: 'MISSING_NAME', error_message: 'Nama wajib diisi', reconciliation_notes: 'Lengkapi nama' }
  };

  const mockData: UnifiedTelemetryStreamData = {
    topic: 'telemetry.batch_queue',
    consumer_state: {
      last_sequence: 3,
      last_event_id: 'EVT-003',
      connection_state: 'CONNECTED'
    },
    events: [evt1, evt2, evt3],
    unread_failed_count: 1
  };

  // Test 1: Event -> ViewModel Mapping & Narrowing
  console.log("Test 1: Event -> ViewModel Mapping & Narrowing");
  const vm = adaptTelemetryStreamToViewModel(mockData);
  assert.strictEqual(vm.events.length, 3);
  assert.strictEqual(vm.events[0].sequenceFormatted, '#1');
  assert.strictEqual(vm.events[1].typeLabel, 'Kemajuan Batch');
  assert.strictEqual(vm.events[2].hasError, true);
  console.log("   ✅ Passed: Telemetry events mapped and formatted correctly.");

  // Test 2: Discriminated Payload Projection
  console.log("Test 2: Discriminated Payload Projection");
  assert.strictEqual(vm.events[1].progressFormatted, '20%');
  assert.strictEqual(vm.events[1].progressPercent, 20);
  assert.ok(vm.events[2].detailText.includes('MISSING_NAME'));
  console.log("   ✅ Passed: Discriminated payload properties projected correctly.");

  // Test 3: F10 Batch Lifecycle Metrics Projection
  console.log("Test 3: F10 Batch Lifecycle Metrics Projection");
  assert.strictEqual(vm.metrics.batchesStarted, 1);
  assert.strictEqual(vm.metrics.rowsFailed, 1);
  assert.strictEqual(vm.metrics.totalEvents, 3);
  console.log("   ✅ Passed: Batch lifecycle summary metrics calculated correctly.");

  // Test 4: Connection & Reconnect State Projection
  console.log("Test 4: Connection & Reconnect State Projection");
  assert.strictEqual(vm.connection.state, 'CONNECTED');
  assert.strictEqual(vm.connection.stateLabel, 'Terhubung Live Stream');
  console.log("   ✅ Passed: Connection state projected correctly.");

  // Test 5: Replay State & Deduplication Metric Inflation Check
  console.log("Test 5: Replay State & Deduplication Metric Inflation Check");
  // Pass duplicate event in replay stream
  const vmWithReplay = adaptTelemetryStreamToViewModel(mockData, [evt1]);
  assert.strictEqual(vmWithReplay.events.length, 3, "Duplicate evt1 MUST NOT inflate event count");
  assert.strictEqual(vmWithReplay.metrics.totalEvents, 3, "Duplicate evt1 MUST NOT inflate total metrics");
  console.log("   ✅ Passed: Deduplication prevented metric inflation from replayed events.");

  // Test 6: Pure Adapter Invariants (0 Supabase / 0 Realtime SDK / 0 WebSocket / 0 Auth Logic)
  console.log("Test 6: Pure Adapter Invariants (0 Supabase / 0 Realtime SDK / 0 WebSocket / 0 Auth Logic)");
  const jsonStr = JSON.stringify(vmWithReplay);
  assert.strictEqual(jsonStr.includes('supabase'), false, "supabase reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('RealtimeClient'), false, "RealtimeClient reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('WebSocket'), false, "WebSocket reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('role'), false, "role MUST NOT exist");
  console.log("   ✅ Passed: Zero transport SDK / Supabase references or auth logic in ViewModel payload.");

  console.log("\n🎉 ALL F11 TELEMETRY ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runTelemetryAdapterUnitTests();
