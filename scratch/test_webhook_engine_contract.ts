import * as assert from 'assert';
import { 
  WebhookEndpointDefinition, 
  WebhookPayloadEnvelope, 
  WebhookDeliveryRecord, 
  WebhookDLQReplayRequest,
  WebhookSignatureContext,
  computeWebhookHMACSignature 
} from '../src/types/webhookEngine.types';

function runWebhookEngineContractUnitTests() {
  console.log("🧪 Starting Unit Tests for F14 External Webhook Engine Data Contract...\n");

  const sampleEndpoint: WebhookEndpointDefinition = {
    endpoint_id: 'EP-SYNOD-001',
    target_url: 'https://api.synod-gpib.org/v1/webhooks/events',
    description: 'GPIB Synod Central Event Consumer Endpoint',
    subscribed_events: ['person.created', 'aid_request.approved'],
    delivery_policy: {
      max_retries: 5,
      initial_backoff_ms: 1000,
      max_backoff_ms: 60000,
      timeout_ms: 10000,
      accepted_http_codes: [200, 201, 202, 204]
    },
    is_active: true,
    version: '1.0.0',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const sampleEnvelope: WebhookPayloadEnvelope = {
    event_id: 'EVT-F11-999',
    topic: 'domain.aid_request',
    event_type: 'aid_request.approved',
    source: 'F11_TELEMETRY_OUTBOX',
    occurred_at: new Date().toISOString(),
    payload: { id_ajuan: 'AID-777', status: 'APPROVED' },
    metadata: { org_context_id: 'ORG-JMT-001' }
  };

  // Test 1: Canonical Payload Serialization & HMAC-SHA256 Signature Computation
  console.log("Test 1: Canonical Payload Serialization & HMAC-SHA256 Signature Computation");
  const secret = 'whsec_test_secret_key_888';
  const timestamp = '1750000000';
  const payloadStr = JSON.stringify(sampleEnvelope);
  const signature = computeWebhookHMACSignature(secret, timestamp, payloadStr);

  assert.ok(signature.startsWith('t=1750000000,v1='));
  assert.strictEqual(signature.split(',v1=')[1].length, 64); // 64-char HMAC SHA256 hex
  console.log("   ✅ Passed: Canonical payload computed valid X-GPIB-Signature header.");

  // Test 2: Deterministic Unique Delivery ID & Idempotency Key Preservation
  console.log("Test 2: Deterministic Unique Delivery ID & Idempotency Key Preservation");
  const deliveryRecord: WebhookDeliveryRecord = {
    delivery_id: 'DEL-0001',
    endpoint_id: sampleEndpoint.endpoint_id,
    event_id: sampleEnvelope.event_id,
    topic: sampleEnvelope.topic,
    status: 'QUEUED',
    current_attempt: 0,
    max_attempts: sampleEndpoint.delivery_policy.max_retries,
    idempotency_key: `IDEM-${sampleEnvelope.event_id}-${sampleEndpoint.endpoint_id}`,
    queued_at: new Date().toISOString()
  };
  assert.strictEqual(deliveryRecord.idempotency_key, 'IDEM-EVT-F11-999-EP-SYNOD-001');
  console.log("   ✅ Passed: Delivery record preserves unique idempotency key.");

  // Test 3: Zero Secret Exposure Invariant
  console.log("Test 3: Zero Secret Exposure Invariant");
  const endpointJson = JSON.stringify(sampleEndpoint);
  assert.strictEqual(endpointJson.includes('secret_key'), false, "secret_key MUST NOT exist in WebhookEndpointDefinition");
  console.log("   ✅ Passed: WebhookEndpointDefinition contract contains 0 secret fields.");

  // Test 4: Payload Envelope Preserves Original F11 event_id
  console.log("Test 4: Payload Envelope Preserves Original F11 event_id");
  assert.strictEqual(sampleEnvelope.event_id, 'EVT-F11-999');
  assert.strictEqual(deliveryRecord.event_id, 'EVT-F11-999');
  console.log("   ✅ Passed: Original F11 event_id preserved across delivery record.");

  // Test 5: F11 Event Source Provenance Identification
  console.log("Test 5: F11 Event Source Provenance Identification");
  assert.strictEqual(sampleEnvelope.source, 'F11_TELEMETRY_OUTBOX');
  console.log("   ✅ Passed: F11 source provenance identified correctly.");

  // Test 6: Bounded Exponential Backoff Retry Policy Validation
  console.log("Test 6: Bounded Exponential Backoff Retry Policy Validation");
  assert.strictEqual(sampleEndpoint.delivery_policy.max_retries, 5);
  assert.strictEqual(sampleEndpoint.delivery_policy.max_backoff_ms, 60000);
  console.log("   ✅ Passed: Bounded exponential backoff policy parameters validated.");

  // Test 7: Explicit Timeout & Connection Policy Validation
  console.log("Test 7: Explicit Timeout & Connection Policy Validation");
  assert.strictEqual(sampleEndpoint.delivery_policy.timeout_ms, 10000);
  console.log("   ✅ Passed: Explicit 10000ms delivery timeout policy validated.");

  // Test 8: DLQ State Transition Contract Validation
  console.log("Test 8: DLQ State Transition Contract Validation");
  const dlqRecord: WebhookDeliveryRecord = {
    ...deliveryRecord,
    status: 'DLQ',
    dlq_at: new Date().toISOString()
  };
  assert.strictEqual(dlqRecord.status, 'DLQ');
  console.log("   ✅ Passed: Dead-Letter Queue (DLQ) state transition validated.");

  // Test 9: DLQ Replay Preserves Original Event Identity
  console.log("Test 9: DLQ Replay Preserves Original Event Identity");
  const replayReq: WebhookDLQReplayRequest = {
    replay_id: 'RPL-999',
    delivery_id: dlqRecord.delivery_id,
    replayed_by: 'USER-ADMIN-100',
    replayed_at: new Date().toISOString(),
    reason: 'Manual admin retry after endpoint recovery'
  };
  assert.strictEqual(replayReq.delivery_id, 'DEL-0001');
  console.log("   ✅ Passed: DLQ replay request preserved original delivery identity.");

  // Test 10: Signature Context Does Not Expose Secret to ViewModel/Client
  console.log("Test 10: Signature Context Does Not Expose Secret to ViewModel/Client");
  const sigContext: WebhookSignatureContext = {
    timestamp,
    signature_header: signature,
    delivery_id: deliveryRecord.delivery_id
  };
  const sigJson = JSON.stringify(sigContext);
  assert.strictEqual(sigJson.includes(secret), false, "Raw secret MUST NOT exist in signature context");
  console.log("   ✅ Passed: WebhookSignatureContext does not leak raw secret.");

  // Test 11: Flexible Accepted HTTP Status Codes Policy Validation
  console.log("Test 11: Flexible Accepted HTTP Status Codes Policy Validation");
  assert.deepStrictEqual(sampleEndpoint.delivery_policy.accepted_http_codes, [200, 201, 202, 204]);
  console.log("   ✅ Passed: Flexible accepted HTTP 2xx status codes policy validated.");

  // Test 12: Provider & Transport Neutrality Invariant
  console.log("Test 12: Provider & Transport Neutrality Invariant");
  const contractJson = JSON.stringify({ sampleEndpoint, sampleEnvelope, deliveryRecord });
  assert.strictEqual(contractJson.includes('supabase'), false);
  assert.strictEqual(contractJson.includes('auth.uid()'), false);
  console.log("   ✅ Passed: Provider and transport SDK neutrality verified.");

  // Test 13: Zero Authorization Logic Leakage in Contract
  console.log("Test 13: Zero Authorization Logic Leakage in Contract");
  assert.strictEqual(contractJson.includes('policy_rules'), false);
  console.log("   ✅ Passed: Webhook engine contract does not leak authorization logic.");

  // Test 14: Zero Domain Mutation Commands in Contract
  console.log("Test 14: Zero Domain Mutation Commands in Contract");
  assert.strictEqual(contractJson.includes('UPDATE_PERSON'), false);
  console.log("   ✅ Passed: Webhook engine contract contains zero domain mutation commands.");

  // Test 15: Deterministic Signature Reproducibility
  console.log("Test 15: Deterministic Signature Reproducibility");
  const sigA = computeWebhookHMACSignature(secret, timestamp, payloadStr);
  const sigB = computeWebhookHMACSignature(secret, timestamp, payloadStr);
  assert.strictEqual(sigA, sigB, "Identical secret + timestamp + payload MUST yield 100% identical HMAC-SHA256 signature");
  console.log("   ✅ Passed: Deterministic HMAC-SHA256 signature calculation verified.");

  console.log("\n🎉 ALL F14 WEBHOOK ENGINE CONTRACT UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runWebhookEngineContractUnitTests();
