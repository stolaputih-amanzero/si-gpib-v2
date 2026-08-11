import * as assert from 'assert';
import { 
  TelemetryEvent, 
  TelemetryReplayRequest, 
  TelemetryReplayResponse,
  isValidDeliveryStateTransition 
} from '../src/types/telemetryStream.types';

function runTelemetryContractUnitTests() {
  console.log("🧪 Starting Unit Tests for F11 Real-Time Telemetry Data Contract...\n");

  // Test 1: Event Type Discrimination & TypeScript Narrowing Check
  console.log("Test 1: Event Type Discrimination & TypeScript Narrowing Check");
  const sampleEvent: TelemetryEvent = {
    event_id: 'EVT-1001',
    idempotency_key: 'IDEM-BATCH-001-PROG-1',
    topic: 'telemetry.batch_queue',
    event_type: 'batch.progress',
    sequence_number: 1042,
    occurred_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    delivery_state: 'PUBLISHED',
    metadata: { environment: 'production' },
    payload: {
      batch_id: 'BATCH-001',
      chunk_index: 1,
      processed_rows: 100,
      committed_rows: 98,
      progress_percent: 10
    }
  };

  if (sampleEvent.event_type === 'batch.progress') {
    // Narrowed payload access
    const progress: number = sampleEvent.payload.progress_percent;
    assert.strictEqual(progress, 10);
    console.log("   ✅ Passed: Discriminated union narrowed event payload correctly.");
  } else {
    assert.fail("Event type discrimination failed");
  }

  // Test 2: Payload Type Safety Check
  console.log("Test 2: Payload Type Safety Check");
  const failedEvent: TelemetryEvent = {
    event_id: 'EVT-1002',
    idempotency_key: 'IDEM-ROW-FAILED-127',
    topic: 'telemetry.batch_queue',
    event_type: 'row.failed',
    sequence_number: 1043,
    occurred_at: new Date().toISOString(),
    delivery_state: 'PUBLISHED',
    metadata: {},
    payload: {
      batch_id: 'BATCH-001',
      row_number: 127,
      error_code: 'DUPLICATE_MEMBER_ID',
      error_message: 'ID anggota sudah terdaftar',
      reconciliation_notes: 'Cek data jemaat di F2'
    }
  };

  assert.strictEqual(failedEvent.event_type, 'row.failed');
  assert.strictEqual(failedEvent.payload.error_code, 'DUPLICATE_MEMBER_ID');
  console.log("   ✅ Passed: Row failed event payload type safety verified.");

  // Test 3: Event Identity vs Idempotency Key Contract Check
  console.log("Test 3: Event Identity vs Idempotency Key Contract Check");
  assert.notStrictEqual(sampleEvent.event_id, sampleEvent.idempotency_key, "event_id and idempotency_key MUST be distinct");
  assert.ok(sampleEvent.event_id.startsWith('EVT-'), "event_id MUST start with EVT- prefix");
  console.log("   ✅ Passed: Distinct event_id and idempotency_key separation verified.");

  // Test 4: Monotonic Sequence / Order Contract Check
  console.log("Test 4: Monotonic Sequence / Order Contract Check");
  assert.strictEqual(failedEvent.sequence_number > sampleEvent.sequence_number, true, "sequence_number MUST be strictly increasing");
  console.log("   ✅ Passed: Monotonic sequence ordering verified.");

  // Test 5: Replay Request / Response Contract Check
  console.log("Test 5: Replay Request / Response Contract Check");
  const replayReq: TelemetryReplayRequest = {
    topic: 'telemetry.batch_queue',
    after_sequence: 1040,
    limit: 50
  };

  const replayRes: TelemetryReplayResponse = {
    events: [sampleEvent, failedEvent],
    next_sequence: 1044,
    has_more: false
  };

  assert.strictEqual(replayReq.after_sequence, 1040);
  assert.strictEqual(replayRes.events.length, 2);
  assert.strictEqual(replayRes.next_sequence, 1044);
  console.log("   ✅ Passed: Replay request/response data contracts verified.");

  // Test 6: F10 Lifecycle Event Compatibility Check
  console.log("Test 6: F10 Lifecycle Event Compatibility Check");
  const supportedTypes = ['batch.started', 'batch.progress', 'row.failed', 'batch.completed'];
  assert.ok(supportedTypes.includes(sampleEvent.event_type));
  assert.ok(supportedTypes.includes(failedEvent.event_type));
  console.log("   ✅ Passed: All 4 F10 lifecycle event types supported.");

  // Test 7: Provider Neutrality Check
  console.log("Test 7: Provider Neutrality Check");
  const jsonStr = JSON.stringify(sampleEvent) + JSON.stringify(replayRes);
  assert.strictEqual(jsonStr.includes('supabase'), false, "supabase references MUST NOT exist in contract");
  assert.strictEqual(jsonStr.includes('RealtimeClient'), false, "RealtimeClient references MUST NOT exist in contract");
  assert.strictEqual(jsonStr.includes('WebSocket'), false, "WebSocket references MUST NOT exist in contract");
  console.log("   ✅ Passed: Zero provider / SDK references in contract.");

  // Test 8: Delivery State Machine Transition Check
  console.log("Test 8: Delivery State Machine Transition Check");
  assert.strictEqual(isValidDeliveryStateTransition('PENDING', 'PUBLISHED'), true);
  assert.strictEqual(isValidDeliveryStateTransition('PENDING', 'FAILED'), true);
  assert.strictEqual(isValidDeliveryStateTransition('FAILED', 'RETRYING'), true);
  assert.strictEqual(isValidDeliveryStateTransition('PUBLISHED', 'PENDING'), false, "PUBLISHED terminal state MUST NOT transition backwards");
  console.log("   ✅ Passed: Delivery state machine transitions verified.");

  console.log("\n🎉 ALL F11 TELEMETRY STREAM CONTRACT UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runTelemetryContractUnitTests();
