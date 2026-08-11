import * as assert from 'assert';
import { PolicyDecision, PolicyRuleDefinition } from '../src/types/accessControl.types';
import { adaptAccessControlToViewModel } from '../src/adapters/accessControlViewModelAdapter';

function runAuthorizationAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptAccessControlToViewModel...\n");

  const sampleRules: PolicyRuleDefinition[] = [
    {
      policy_id: 'POL-001',
      policy_name: 'Person Profile Mutation Policy',
      policy_version: '1.0.0',
      target_resource_type: 'person',
      allowed_actions: ['write', 'read'],
      required_role: 'ADMIN_JEMAAT',
      allowed_scope_type: 'JEMAAT'
    }
  ];

  const allowDecision: PolicyDecision = {
    request_id: 'REQ-100',
    effect: 'ALLOW',
    policy_id: 'POL-001',
    policy_version: '1.0.0',
    evaluated_at: new Date().toISOString(),
    reason_code: 'ALLOWED_EXPLICIT_POLICY',
    granted_scope: 'ORG-JMT-001'
  };

  const denyTenantDecision: PolicyDecision = {
    request_id: 'REQ-101',
    effect: 'DENY',
    policy_id: 'POL-001',
    policy_version: '1.0.0',
    evaluated_at: new Date().toISOString(),
    reason_code: 'DENIED_TENANT_BOUNDARY',
    denial_message: 'Subject org scope does not cover resource org context boundary.'
  };

  const denyExpiredDecision: PolicyDecision = {
    request_id: 'REQ-102',
    effect: 'DENY',
    policy_id: 'POL-001',
    policy_version: '1.0.0',
    evaluated_at: new Date().toISOString(),
    reason_code: 'DENIED_TEMPORAL_EXPIRED',
    denial_message: 'Policy rule has expired.'
  };

  // Scenario 1: ALLOW Decision -> Correct ViewModel Projection
  console.log("Scenario 1: ALLOW Decision -> Correct ViewModel Projection");
  const vm1 = adaptAccessControlToViewModel(sampleRules, [allowDecision]);
  assert.strictEqual(vm1.recentDecisions.length, 1);
  assert.strictEqual(vm1.recentDecisions[0].effectLabel, 'DIIZINKAN (ALLOW)');
  assert.strictEqual(vm1.recentDecisions[0].isAllowed, true);
  console.log("   ✅ Passed: ALLOW decision projected correctly into ViewModel.");

  // Scenario 2: DENY Decision -> Correct ReasonCode Projection
  console.log("Scenario 2: DENY Decision -> Correct ReasonCode Projection");
  const vm2 = adaptAccessControlToViewModel(sampleRules, [denyTenantDecision]);
  assert.strictEqual(vm2.recentDecisions[0].effectLabel, 'DITOLAK (DENY)');
  assert.strictEqual(vm2.recentDecisions[0].reasonCodeLabel, 'Ditolak: Batas Wilayah Organisasi');
  console.log("   ✅ Passed: DENY decision projected correct Indonesian reason code label.");

  // Scenario 3: Tenant Boundary Denial -> Safe UI Representation
  console.log("Scenario 3: Tenant Boundary Denial -> Safe UI Representation");
  assert.ok(vm2.recentDecisions[0].reasonExplanation.includes('berada di luar batas wilayah organisasi'));
  console.log("   ✅ Passed: Tenant boundary denial yielded safe UI explanation.");

  // Scenario 4: Expired Policy -> Correct Temporal State
  console.log("Scenario 4: Expired Policy -> Correct Temporal State");
  const vm4 = adaptAccessControlToViewModel(sampleRules, [denyExpiredDecision]);
  assert.strictEqual(vm4.recentDecisions[0].reasonCodeLabel, 'Ditolak: Masa Berlaku Aturan Kadaluarsa');
  console.log("   ✅ Passed: Expired policy decision projected temporal state correctly.");

  // Scenario 5: Hierarchy Scope -> Parent/Child Authority Representation
  console.log("Scenario 5: Hierarchy Scope -> Parent/Child Authority Representation");
  assert.strictEqual(vm1.policies[0].allowedScopeLabel, 'JEMAAT');
  assert.strictEqual(vm1.policies[0].requiredRoleLabel, 'ADMIN JEMAAT');
  console.log("   ✅ Passed: Hierarchy scope and role labels formatted correctly.");

  // Scenario 6: Pure Adapter Invariants (0 Supabase / 0 Realtime SDK / 0 WebSocket / 0 Auth / 0 RLS logic)
  console.log("Scenario 6: Pure Adapter Invariants (0 Supabase / 0 Realtime SDK / 0 WebSocket / 0 Auth / 0 RLS logic)");
  const jsonStr = JSON.stringify(vm1);
  assert.strictEqual(jsonStr.includes('supabase'), false, "supabase reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('auth.uid()'), false, "auth.uid() reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('WebSocket'), false, "WebSocket reference MUST NOT exist");
  console.log("   ✅ Passed: Zero transport SDK / Supabase or RLS references in ViewModel payload.");

  console.log("\n🎉 ALL 6 F12 AUTHORIZATION ADAPTER SCENARIOS PASSED SUCCESSFULLY!\n");
}

runAuthorizationAdapterUnitTests();
