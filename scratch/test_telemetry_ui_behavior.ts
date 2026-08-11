import * as assert from 'assert';
import { UnifiedTelemetryStreamData, TelemetryEvent } from '../src/types/telemetryStream.types';
import { adaptTelemetryStreamToViewModel } from '../src/adapters/telemetryStreamViewModelAdapter';

function runTelemetryUIBehaviorHarness() {
  console.log("🧪 Starting F11 Telemetry UI & Behavior Lifecycle Harness Test...\n");

  const initialEvt: TelemetryEvent = {
    event_id: 'EVT-100',
    idempotency_key: 'IDEM-100',
    topic: 'telemetry.batch_queue',
    event_type: 'batch.started',
    sequence_number: 1,
    occurred_at: new Date().toISOString(),
    delivery_state: 'PUBLISHED',
    metadata: {},
    payload: { batch_id: 'B-300', target_entity_type: 'person', total_rows: 100, atomicity_policy: 'ALL_OR_NOTHING' }
  };

  let streamState: UnifiedTelemetryStreamData = {
    topic: 'telemetry.batch_queue',
    consumer_state: {
      last_sequence: 1,
      last_event_id: 'EVT-100',
      connection_state: 'CONNECTED'
    },
    events: [initialEvt],
    unread_failed_count: 0
  };

  // Scenario 1: Initial CONNECTED State Verification
  console.log("Scenario 1: Initial CONNECTED State Verification");
  let vm = adaptTelemetryStreamToViewModel(streamState);
  assert.strictEqual(vm.connection.state, 'CONNECTED');
  assert.strictEqual(vm.connection.stateLabel, 'Terhubung Live Stream');
  assert.strictEqual(vm.events.length, 1);
  console.log("   ✅ Passed: Initial CONNECTED state and stream label verified.");

  // Scenario 2: Live Event Arrival Metric Reaction Verification
  console.log("Scenario 2: Live Event Arrival Metric Reaction Verification");
  const progEvt: TelemetryEvent = {
    event_id: 'EVT-101',
    idempotency_key: 'IDEM-101',
    topic: 'telemetry.batch_queue',
    event_type: 'batch.progress',
    sequence_number: 2,
    occurred_at: new Date().toISOString(),
    delivery_state: 'PUBLISHED',
    metadata: {},
    payload: { batch_id: 'B-300', chunk_index: 1, processed_rows: 50, committed_rows: 50, progress_percent: 50 }
  };

  streamState.events.push(progEvt);
  streamState.consumer_state.last_sequence = 2;
  vm = adaptTelemetryStreamToViewModel(streamState);

  assert.strictEqual(vm.events.length, 2);
  assert.strictEqual(vm.metrics.totalEvents, 2);
  assert.strictEqual(vm.connection.lastSequence, 2);
  console.log("   ✅ Passed: Live event arrival updated metrics and sequence number #2.");

  // Scenario 3: batch.progress Metric Update Verification
  console.log("Scenario 3: batch.progress Metric Update Verification");
  assert.strictEqual(vm.events[1].progressPercent, 50);
  assert.strictEqual(vm.events[1].progressFormatted, '50%');
  console.log("   ✅ Passed: Progress percentage projected correctly.");

  // Scenario 4: row.failed Error Indicator Verification
  console.log("Scenario 4: row.failed Error Indicator Verification");
  const failEvt: TelemetryEvent = {
    event_id: 'EVT-102',
    idempotency_key: 'IDEM-102',
    topic: 'telemetry.batch_queue',
    event_type: 'row.failed',
    sequence_number: 3,
    occurred_at: new Date().toISOString(),
    delivery_state: 'PUBLISHED',
    metadata: {},
    payload: { batch_id: 'B-300', row_number: 51, error_code: 'INVALID_DATA', error_message: 'Format email tidak valid', reconciliation_notes: 'Cek email' }
  };

  streamState.events.push(failEvt);
  streamState.consumer_state.last_sequence = 3;
  vm = adaptTelemetryStreamToViewModel(streamState);

  assert.strictEqual(vm.metrics.rowsFailed, 1);
  assert.strictEqual(vm.events[2].hasError, true);
  console.log("   ✅ Passed: row.failed event created failure indicator and updated metrics.");

  // Scenario 5: Duplicate Event Metric Anti-Inflation Verification
  console.log("Scenario 5: Duplicate Event Metric Anti-Inflation Verification");
  streamState.events.push(progEvt); // Duplicate progEvt!
  vm = adaptTelemetryStreamToViewModel(streamState);

  assert.strictEqual(vm.events.length, 3, "Duplicate event MUST be filtered out by adapter");
  assert.strictEqual(vm.metrics.totalEvents, 3);
  console.log("   ✅ Passed: Duplicate event arrival filtered; metric inflation prevented.");

  // Scenario 6: Disconnect Simulation Transition Verification
  console.log("Scenario 6: Disconnect Simulation Transition Verification");
  streamState.consumer_state.connection_state = 'DISCONNECTED';
  vm = adaptTelemetryStreamToViewModel(streamState);

  assert.strictEqual(vm.connection.state, 'DISCONNECTED');
  assert.strictEqual(vm.connection.stateLabel, 'Terputus');
  console.log("   ✅ Passed: Disconnect transition updated connection state to DISCONNECTED.");

  // Scenario 7: Reconnect & Replay Transition Verification
  console.log("Scenario 7: Reconnect & Replay Transition Verification");
  streamState.consumer_state.connection_state = 'REPLAYING';
  vm = adaptTelemetryStreamToViewModel(streamState);

  assert.strictEqual(vm.connection.state, 'REPLAYING');
  assert.strictEqual(vm.connection.stateLabel, 'Memulihkan Replay Sequence...');
  assert.strictEqual(vm.replay.isReplaying, true);
  console.log("   ✅ Passed: Replaying state verified during sequence recovery.");

  // Scenario 8: Replay Deduplication & Resume Live Stream Verification
  console.log("Scenario 8: Replay Deduplication & Resume Live Stream Verification");
  const replayedEvt: TelemetryEvent = {
    event_id: 'EVT-099', // Older sequence missed during offline
    idempotency_key: 'IDEM-099',
    topic: 'telemetry.batch_queue',
    event_type: 'batch.started',
    sequence_number: 0,
    occurred_at: new Date(Date.now() - 300000).toISOString(),
    delivery_state: 'PUBLISHED',
    metadata: {},
    payload: { batch_id: 'B-299', target_entity_type: 'asset', total_rows: 10, atomicity_policy: 'ALL_OR_NOTHING' }
  };

  streamState.consumer_state.connection_state = 'CONNECTED';
  vm = adaptTelemetryStreamToViewModel(streamState, [replayedEvt, initialEvt]);

  assert.strictEqual(vm.connection.state, 'CONNECTED');
  assert.strictEqual(vm.events.length, 4, "Replayed missed event EVT-099 inserted into stream");
  assert.strictEqual(vm.events[0].event_id, 'EVT-099');
  assert.strictEqual(vm.events[0].isReplayed, true);
  console.log("   ✅ Passed: Replay recovery deduplicated missed event and resumed LIVE stream.");

  // Scenario 9: Out-of-Order Event Sequence Buffer Verification
  console.log("Scenario 9: Out-of-Order Event Sequence Buffer Verification");
  for (let i = 0; i < vm.events.length - 1; i++) {
    assert.ok(vm.events[i].sequence_number <= vm.events[i + 1].sequence_number, "Events MUST be strictly ordered ascending");
  }
  console.log("   ✅ Passed: Out-of-order events strictly sorted by sequence_number ascending.");

  // Scenario 10: Zero-PII Payload Protection Verification
  console.log("Scenario 10: Zero-PII Payload Protection Verification");
  const vmJson = JSON.stringify(vm);
  const forbiddenPii = ['full_name', 'phone', 'email', 'address', 'nik', 'raw_identity', 'password', 'access_token'];
  for (const piiKey of forbiddenPii) {
    assert.strictEqual(vmJson.includes(`"${piiKey}":`), false, `Forbidden PII key '${piiKey}' MUST NOT exist in ViewModel UI payload`);
  }
  console.log("   ✅ Passed: Zero-PII protection verified across all ViewModel properties.");

  console.log("\n🎉 ALL 10 F11 TELEMETRY UI & BEHAVIOR HARNESS SCENARIOS PASSED 100% SUCCESSFULLY!\n");
}

runTelemetryUIBehaviorHarness();
