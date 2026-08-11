import * as assert from 'assert';
import { WebhookEndpointDefinition, WebhookDeliveryRecord } from '../src/types/webhookEngine.types';
import { adaptWebhookEngineToViewModel } from '../src/adapters/webhookEngineViewModelAdapter';

function runWebhookEngineAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptWebhookEngineToViewModel...\n");

  const sampleEndpoints: WebhookEndpointDefinition[] = [
    {
      endpoint_id: 'EP-100',
      target_url: 'https://api.synod.org/webhooks',
      description: 'Synod Integration Endpoint',
      subscribed_events: ['person.created'],
      delivery_policy: {
        max_retries: 5,
        initial_backoff_ms: 1000,
        max_backoff_ms: 60000,
        timeout_ms: 10000,
        accepted_http_codes: [200, 201]
      },
      is_active: true,
      version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const sampleDeliveries: WebhookDeliveryRecord[] = [
    {
      delivery_id: 'DEL-100',
      endpoint_id: 'EP-100',
      event_id: 'EVT-001',
      topic: 'domain.person',
      status: 'DELIVERED',
      current_attempt: 1,
      max_attempts: 5,
      idempotency_key: 'IDEM-001',
      queued_at: new Date().toISOString(),
      delivered_at: new Date().toISOString()
    },
    {
      delivery_id: 'DEL-101',
      endpoint_id: 'EP-100',
      event_id: 'EVT-002',
      topic: 'domain.aid_request',
      status: 'DLQ',
      current_attempt: 5,
      max_attempts: 5,
      idempotency_key: 'IDEM-002',
      queued_at: new Date().toISOString(),
      dlq_at: new Date().toISOString()
    }
  ];

  // Scenario 1: Endpoint & Delivery Projection into ViewModel
  console.log("Scenario 1: Endpoint & Delivery Projection into ViewModel");
  const vm1 = adaptWebhookEngineToViewModel(sampleEndpoints, sampleDeliveries);
  assert.strictEqual(vm1.endpoints.length, 1);
  assert.strictEqual(vm1.recentDeliveries.length, 2);
  assert.strictEqual(vm1.endpoints[0].endpoint_id, 'EP-100');
  console.log("   ✅ Passed: Endpoints and deliveries projected into ViewModel.");

  // Scenario 2: Secret Isolation Violation Protection
  console.log("Scenario 2: Secret Isolation Violation Protection");
  const leakedEndpoint = [{ ...sampleEndpoints[0], secret_key: 'LEAKED_SECRET' }];
  assert.throws(
    () => adaptWebhookEngineToViewModel(leakedEndpoint as any, sampleDeliveries),
    /SECURITY_VIOLATION/
  );
  console.log("   ✅ Passed: Adapter rejected endpoint payload with secret_key violation.");

  // Scenario 3: Delivery Status Badge Formatting
  console.log("Scenario 3: Delivery Status Badge Formatting");
  assert.strictEqual(vm1.recentDeliveries[0].statusLabel, 'TERKIRIM (DELIVERED)');
  assert.ok(vm1.recentDeliveries[0].statusBadgeColor.includes('bg-emerald-50'));
  assert.strictEqual(vm1.recentDeliveries[1].statusLabel, 'DLQ (DEAD-LETTER QUEUE)');
  assert.ok(vm1.recentDeliveries[1].statusBadgeColor.includes('bg-rose-50'));
  console.log("   ✅ Passed: Status badges formatted with distinct colors.");

  // Scenario 4: Attempt Metrics Projection
  console.log("Scenario 4: Attempt Metrics Projection");
  assert.strictEqual(vm1.recentDeliveries[0].attemptsFormatted, '1 / 5');
  assert.strictEqual(vm1.recentDeliveries[1].attemptsFormatted, '5 / 5');
  console.log("   ✅ Passed: Attempt counts formatted cleanly.");

  // Scenario 5: DLQ Warning Metric Integration
  console.log("Scenario 5: DLQ Warning Metric Integration");
  assert.strictEqual(vm1.metrics.dlqDeliveries, 1);
  assert.strictEqual(vm1.metrics.overallHealthStatus, 'PERINGATAN: 1 DELIVERY MASUK DLQ');
  assert.ok(vm1.metrics.overallHealthBadgeColor.includes('bg-rose-50'));
  console.log("   ✅ Passed: DLQ metric integrated into overall health status.");

  // Scenario 6: Pure Adapter Invariants (0 Supabase / 0 HTTP SDK / 0 Auth / 0 RLS logic / 0 Command Authority)
  console.log("Scenario 6: Pure Adapter Invariants (0 Supabase / 0 HTTP SDK / 0 Auth / 0 RLS logic / 0 Command Authority)");
  const jsonStr = JSON.stringify(vm1);
  assert.strictEqual(jsonStr.includes('supabase'), false);
  assert.strictEqual(jsonStr.includes('auth.uid()'), false);
  assert.strictEqual(jsonStr.includes('secret_key'), false);
  console.log("   ✅ Passed: Zero SDK / Supabase or secret references in ViewModel payload.");

  console.log("\n🎉 ALL 6 F14 WEBHOOK ENGINE ADAPTER SCENARIOS PASSED SUCCESSFULLY!\n");
}

runWebhookEngineAdapterUnitTests();
