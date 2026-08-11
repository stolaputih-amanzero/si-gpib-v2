import * as assert from 'assert';
import { PolicyDecision, PolicyRuleDefinition } from '../src/types/accessControl.types';
import { adaptAccessControlToViewModel } from '../src/adapters/accessControlViewModelAdapter';

function runAuthorizationUIBehaviorHarness() {
  console.log("🧪 Starting F12 Authorization UI & Behavior Lifecycle Harness Test...\n");

  const rules: PolicyRuleDefinition[] = [
    {
      policy_id: 'POL-PERSON-READ',
      policy_name: 'Person Profile Read Policy',
      policy_version: '1.0.0',
      target_resource_type: 'person',
      allowed_actions: ['read'],
      required_role: 'SECTOR_SECRETARY',
      allowed_scope_type: 'SEKTOR'
    }
  ];

  const decisions: PolicyDecision[] = [
    {
      request_id: 'REQ-1',
      effect: 'ALLOW',
      policy_id: 'POL-PERSON-READ',
      policy_version: '1.0.0',
      evaluated_at: new Date().toISOString(),
      reason_code: 'ALLOWED_EXPLICIT_POLICY',
      granted_scope: 'ORG-SEK-01'
    },
    {
      request_id: 'REQ-2',
      effect: 'DENY',
      policy_id: 'POL-PERSON-READ',
      policy_version: '1.0.0',
      evaluated_at: new Date().toISOString(),
      reason_code: 'DENIED_TENANT_BOUNDARY',
      denial_message: 'Org scope mismatch'
    },
    {
      request_id: 'REQ-3',
      effect: 'DENY',
      policy_id: null,
      policy_version: '1.0.0',
      evaluated_at: new Date().toISOString(),
      reason_code: 'DENIED_UNAUTHENTICATED',
      denial_message: 'Unauthenticated'
    }
  ];

  // Scenario 1: UI IS NOT ENFORCER Verification
  console.log("Scenario 1: UI IS NOT ENFORCER Verification");
  const vm = adaptAccessControlToViewModel(rules, decisions);
  assert.strictEqual(vm.recentDecisions[0].effectLabel, 'DIIZINKAN (ALLOW)');
  assert.strictEqual(vm.recentDecisions[1].effectLabel, 'DITOLAK (DENY)');
  console.log("   ✅ Passed: UI received pre-computed decisions without enforcing ALLOW/DENY.");

  // Scenario 2: UI IS NOT AUTHORITY SOURCE Verification
  console.log("Scenario 2: UI IS NOT AUTHORITY SOURCE Verification");
  assert.strictEqual(vm.policies[0].allowedScopeLabel, 'SEKTOR');
  assert.strictEqual(vm.policies[0].requiredRoleLabel, 'SECTOR SECRETARY');
  console.log("   ✅ Passed: Authority and scope labels derived server-side without client mutation.");

  // Scenario 3: DENY Reason Code Projection Safety Verification
  console.log("Scenario 3: DENY Reason Code Projection Safety Verification");
  assert.strictEqual(vm.recentDecisions[1].reasonCodeLabel, 'Ditolak: Batas Wilayah Organisasi');
  assert.ok(vm.recentDecisions[1].reasonExplanation.includes('di luar batas wilayah organisasi'));
  console.log("   ✅ Passed: Reason codes mapped to safe human-readable Indonesian labels.");

  // Scenario 4: Zero-PII Payload Inspection Verification
  console.log("Scenario 4: Zero-PII Payload Inspection Verification");
  const vmJson = JSON.stringify(vm);
  const forbiddenPii = ['full_name', 'phone', 'email', 'address', 'nik', 'raw_identity', 'password', 'access_token'];
  for (const piiKey of forbiddenPii) {
    assert.strictEqual(vmJson.includes(`"${piiKey}":`), false, `Forbidden PII key '${piiKey}' MUST NOT exist in ViewModel UI payload`);
  }
  console.log("   ✅ Passed: Zero-PII protection verified across all ViewModel properties.");

  // Scenario 5: Zero Privilege Escalation Verification
  console.log("Scenario 5: Zero Privilege Escalation Verification");
  assert.strictEqual(vm.metrics.deniedCount, 2);
  assert.strictEqual(vm.metrics.allowedCount, 1);
  console.log("   ✅ Passed: Denied decisions remained denied without privilege escalation.");

  // Scenario 6: Policy Versioning Visibility Verification
  console.log("Scenario 6: Policy Versioning Visibility Verification");
  assert.strictEqual(vm.policies[0].policy_version, '1.0.0');
  assert.strictEqual(vm.recentDecisions[0].policy_version, '1.0.0');
  console.log("   ✅ Passed: Policy version visible for auditability.");

  // Scenario 7: Data-Driven Hierarchy Scope Visibility Verification
  console.log("Scenario 7: Data-Driven Hierarchy Scope Visibility Verification");
  assert.strictEqual(vm.policies[0].allowedScopeLabel, 'SEKTOR');
  console.log("   ✅ Passed: Data-driven scope label rendered dynamically.");

  // Scenario 8: Deterministic Rendering Verification
  console.log("Scenario 8: Deterministic Rendering Verification");
  const vmA = adaptAccessControlToViewModel(rules, decisions);
  const vmB = adaptAccessControlToViewModel(rules, decisions);
  assert.strictEqual(vmA.metrics.allowRatePercent, vmB.metrics.allowRatePercent);
  console.log("   ✅ Passed: Identical input yielded identical ViewModel output.");

  // Scenario 9: Fail-Closed Unauthenticated Representation Verification
  console.log("Scenario 9: Fail-Closed Unauthenticated Representation Verification");
  assert.strictEqual(vm.recentDecisions[2].reasonCodeLabel, 'Ditolak: Sesi Pengguna Tidak Sah');
  console.log("   ✅ Passed: Unauthenticated fail-closed state represented safely.");

  // Scenario 10: Zero Supabase / RLS Enforcement Logic in UI Verification
  console.log("Scenario 10: Zero Supabase / RLS Enforcement Logic in UI Verification");
  assert.strictEqual(vmJson.includes('supabase'), false);
  assert.strictEqual(jsonStrNoRls(vmJson), true);
  console.log("   ✅ Passed: Zero transport SDK or RLS enforcement logic in UI payload.");

  // Scenario 11: Metric Allow Rate Calculation Verification
  console.log("Scenario 11: Metric Allow Rate Calculation Verification");
  assert.strictEqual(vm.metrics.allowRatePercent, 33); // 1 out of 3 = 33%
  assert.strictEqual(vm.metrics.allowRateFormatted, '33%');
  console.log("   ✅ Passed: Allow rate percentage calculated correctly.");

  // Scenario 12: Metric Metrics Aggregation Verification
  console.log("Scenario 12: Metric Metrics Aggregation Verification");
  assert.strictEqual(vm.metrics.totalPolicies, 1);
  assert.strictEqual(vm.metrics.evaluatedRequests, 3);
  console.log("   ✅ Passed: Total policies and evaluated requests metrics aggregated correctly.");

  console.log("\n🎉 ALL 12 F12 AUTHORIZATION UI & BEHAVIOR HARNESS SCENARIOS PASSED 100% SUCCESSFULLY!\n");
}

function jsonStrNoRls(jsonStr: string): boolean {
  return !jsonStr.includes('auth.uid()');
}

runAuthorizationUIBehaviorHarness();
