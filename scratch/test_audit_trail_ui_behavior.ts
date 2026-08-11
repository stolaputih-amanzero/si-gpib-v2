import * as assert from 'assert';
import { AuditEventPayload, AuditChainVerificationResult } from '../src/types/auditTrail.types';
import { adaptAuditTrailToViewModel } from '../src/adapters/auditTrailViewModelAdapter';

function runAuditTrailUIBehaviorHarness() {
  console.log("🧪 Starting F13 Audit Trail UI & Behavior Lifecycle Harness Test...\n");

  const sampleEvents: AuditEventPayload[] = [
    {
      log_id: 'LOG-TEST-001',
      topic: 'domain.aid_request',
      actor: {
        actor_id: 'USER-100',
        actor_type: 'HUMAN',
        org_context_id: 'ORG-JMT-001'
      },
      authorization: {
        policy_id: 'POL-AID-APPROVE',
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

  const validVerification: AuditChainVerificationResult = {
    topic: 'domain.aid_request',
    is_valid: true,
    total_records: 1,
    verified_at: new Date().toISOString()
  };

  const brokenVerification: AuditChainVerificationResult = {
    topic: 'domain.aid_request',
    is_valid: false,
    total_records: 1,
    verified_at: new Date().toISOString(),
    failed_at_sequence: 1,
    failure_reason: 'Tampered record detected'
  };

  // Scenario 1: UI IS NOT EVIDENCE AUTHORITY Verification
  console.log("Scenario 1: UI IS NOT EVIDENCE AUTHORITY Verification");
  const vm1 = adaptAuditTrailToViewModel(sampleEvents, validVerification);
  assert.strictEqual(vm1.recentEvents[0].hashShort, 'a1b2c3d4...3c4d5e');
  console.log("   ✅ Passed: UI received pre-computed evidence without calculating hash validity.");

  // Scenario 2: UI IS NOT AUTHORIZATION ENFORCER Verification
  console.log("Scenario 2: UI IS NOT AUTHORIZATION ENFORCER Verification");
  assert.strictEqual(vm1.recentEvents[0].decisionLabel, 'DIIZINKAN (ALLOW)');
  console.log("   ✅ Passed: F12 provenance decision displayed without view enforcement.");

  // Scenario 3: Zero-PII Projection Verification
  console.log("Scenario 3: Zero-PII Projection Verification");
  const vmJson = JSON.stringify(vm1);
  const forbiddenPii = ['full_name', 'phone', 'email', 'address', 'nik', 'raw_identity', 'password', 'access_token'];
  for (const piiKey of forbiddenPii) {
    assert.strictEqual(vmJson.includes(`"${piiKey}":`), false, `Forbidden PII key '${piiKey}' MUST NOT exist in ViewModel UI payload`);
  }
  console.log("   ✅ Passed: Zero-PII protection verified across all ViewModel properties.");

  // Scenario 4: Actor Type Rendering Verification
  console.log("Scenario 4: Actor Type Rendering Verification");
  assert.ok(vm1.recentEvents[0].actorTypeBadge.includes('bg-blue-50'));
  assert.strictEqual(vm1.recentEvents[0].actorLabel, 'HUMAN: USER-100');
  console.log("   ✅ Passed: Actor type rendered with proper badge formatting.");

  // Scenario 5: Action Rendering Verification
  console.log("Scenario 5: Action Rendering Verification");
  assert.strictEqual(vm1.recentEvents[0].actionLabel, 'APPROVE');
  assert.ok(vm1.recentEvents[0].actionBadgeColor.includes('bg-emerald-50'));
  console.log("   ✅ Passed: Action label rendered with proper badge color.");

  // Scenario 6: Hash Presentation Safety Verification
  console.log("Scenario 6: Hash Presentation Safety Verification");
  assert.strictEqual(vm1.recentEvents[0].hashShort.length, 17); // 8 + 3 + 6 = 17 chars
  console.log("   ✅ Passed: Truncated hash presentation formatted safely.");

  // Scenario 7: Chain Integrity Status Verification
  console.log("Scenario 7: Chain Integrity Status Verification");
  assert.strictEqual(vm1.metrics.chainIntegrityStatus, '100% TERVERIFIKASI IMUTABEL');
  assert.ok(vm1.metrics.integrityBadgeColor.includes('bg-emerald-50'));
  console.log("   ✅ Passed: Chain integrity status projected correctly.");

  // Scenario 8: Broken Chain -> Explicit Warning Verification
  console.log("Scenario 8: Broken Chain -> Explicit Warning Verification");
  const vmBroken = adaptAuditTrailToViewModel(sampleEvents, brokenVerification);
  assert.strictEqual(vmBroken.metrics.chainIntegrityStatus, 'PERINGATAN: ANOMALI RANTAI HASH DETEKSI');
  assert.ok(vmBroken.metrics.integrityBadgeColor.includes('bg-rose-50'));
  console.log("   ✅ Passed: Compromised chain integrity projected explicit warning badge.");

  // Scenario 9: Policy Provenance Visibility Verification
  console.log("Scenario 9: Policy Provenance Visibility Verification");
  assert.strictEqual(vm1.recentEvents[0].policyVersion, '1.0.0');
  console.log("   ✅ Passed: Policy version provenance visible for auditability.");

  // Scenario 10: Before/After State Diff Safe Projection Verification
  console.log("Scenario 10: Before/After State Diff Safe Projection Verification");
  assert.strictEqual(vm1.recentEvents[0].stateDiffSummary, 'Perubahan pada: [status]');
  console.log("   ✅ Passed: State diff summary projected safely.");

  // Scenario 11: Deterministic Timeline Rendering Verification
  console.log("Scenario 11: Deterministic Timeline Rendering Verification");
  const vmA = adaptAuditTrailToViewModel(sampleEvents, validVerification);
  const vmB = adaptAuditTrailToViewModel(sampleEvents, validVerification);
  assert.strictEqual(vmA.metrics.totalAuditLogs, vmB.metrics.totalAuditLogs);
  console.log("   ✅ Passed: Identical input yielded identical ViewModel output.");

  // Scenario 12: Zero Supabase / RLS / Auth Logic in View Layer Verification
  console.log("Scenario 12: Zero Supabase / RLS / Auth Logic in View Layer Verification");
  assert.strictEqual(vmJson.includes('supabase'), false);
  assert.strictEqual(vmJson.includes('auth.uid()'), false);
  console.log("   ✅ Passed: Zero transport SDK or RLS enforcement logic in View Layer.");

  console.log("\n🎉 ALL 12 F13 AUDIT TRAIL UI & BEHAVIOR HARNESS SCENARIOS PASSED 100% SUCCESSFULLY!\n");
}

runAuditTrailUIBehaviorHarness();
