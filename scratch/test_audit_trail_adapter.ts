import * as assert from 'assert';
import { AuditEventPayload, AuditChainVerificationResult } from '../src/types/auditTrail.types';
import { adaptAuditTrailToViewModel } from '../src/adapters/auditTrailViewModelAdapter';

function runAuditTrailAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptAuditTrailToViewModel...\n");

  const sampleEvents: AuditEventPayload[] = [
    {
      log_id: 'LOG-100',
      topic: 'domain.aid_request',
      actor: {
        actor_id: 'USER-100',
        actor_type: 'HUMAN',
        org_context_id: 'ORG-JMT-001'
      },
      authorization: {
        policy_id: 'POL-001',
        policy_version: '1.0.0',
        decision: 'ALLOW',
        reason_code: 'ALLOWED_EXPLICIT_POLICY'
      },
      entity: {
        entity_type: 'aid_request',
        entity_id: 'AID-999',
        action: 'APPROVE'
      },
      mutation: {
        state_before: { status: 'PENDING' },
        state_after: { status: 'APPROVED' },
        changed_fields: ['status']
      },
      correlation: {
        request_id: 'REQ-1',
        transaction_id: 'TX-1',
        correlation_id: 'CORR-1'
      },
      chain: {
        sequence_number: 1,
        prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
        curr_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
        occurred_at: new Date().toISOString()
      }
    }
  ];

  const verificationRes: AuditChainVerificationResult = {
    topic: 'domain.aid_request',
    is_valid: true,
    total_records: 1,
    verified_at: new Date().toISOString()
  };

  // Scenario 1: Audit Event -> Correct ViewModel Projection
  console.log("Scenario 1: Audit Event -> Correct ViewModel Projection");
  const vm1 = adaptAuditTrailToViewModel(sampleEvents, verificationRes);
  assert.strictEqual(vm1.recentEvents.length, 1);
  assert.strictEqual(vm1.recentEvents[0].sequenceFormatted, '#000001');
  assert.strictEqual(vm1.recentEvents[0].actionLabel, 'APPROVE');
  console.log("   ✅ Passed: Audit event projected correctly into ViewModel.");

  // Scenario 2: Actor Type Badge Formatting
  console.log("Scenario 2: Actor Type Badge Formatting");
  assert.ok(vm1.recentEvents[0].actorTypeBadge.includes('bg-blue-50'));
  assert.strictEqual(vm1.recentEvents[0].actorLabel, 'HUMAN: USER-100');
  console.log("   ✅ Passed: Actor type badge formatted correctly.");

  // Scenario 3: Hash Truncation Projection
  console.log("Scenario 3: Hash Truncation Projection");
  assert.strictEqual(vm1.recentEvents[0].hashShort, 'a1b2c3d4...3c4d5e');
  console.log("   ✅ Passed: SHA-256 hash truncated for clean UI presentation.");

  // Scenario 4: State Diff Summary Projection
  console.log("Scenario 4: State Diff Summary Projection");
  assert.strictEqual(vm1.recentEvents[0].stateDiffSummary, 'Perubahan pada: [status]');
  console.log("   ✅ Passed: State diff summary projected safely.");

  // Scenario 5: Chain Verification Metric Integration
  console.log("Scenario 5: Chain Verification Metric Integration");
  assert.strictEqual(vm1.metrics.chainIntegrityStatus, '100% TERVERIFIKASI IMUTABEL');
  assert.ok(vm1.metrics.integrityBadgeColor.includes('bg-emerald-50'));
  console.log("   ✅ Passed: Chain integrity metric integrated correctly.");

  // Scenario 6: Pure Adapter Invariants (0 Supabase / 0 Realtime SDK / 0 WebSocket / 0 Auth / 0 RLS logic)
  console.log("Scenario 6: Pure Adapter Invariants (0 Supabase / 0 Realtime SDK / 0 WebSocket / 0 Auth / 0 RLS logic)");
  const jsonStr = JSON.stringify(vm1);
  assert.strictEqual(jsonStr.includes('supabase'), false, "supabase reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('auth.uid()'), false, "auth.uid() reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('WebSocket'), false, "WebSocket reference MUST NOT exist");
  console.log("   ✅ Passed: Zero transport SDK / Supabase or RLS references in ViewModel payload.");

  console.log("\n🎉 ALL 6 F13 AUDIT TRAIL ADAPTER SCENARIOS PASSED SUCCESSFULLY!\n");
}

runAuditTrailAdapterUnitTests();
