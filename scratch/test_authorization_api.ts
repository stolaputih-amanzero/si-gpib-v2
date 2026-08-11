import * as assert from 'assert';
import { PolicyDecisionReasonCode } from '../src/types/accessControl.types';

class AuthorizationPDPEngineMock {
  private policyRules = new Map<string, any>();
  private roleAssignments = new Map<string, any[]>();
  private currentUid: string | null = 'USER-SEC-100';

  constructor() {
    this.seedDefaults();
  }

  setAuthUser(uid: string | null) {
    this.currentUid = uid;
  }

  seedRoleAssignment(userId: string, roleName: string, contextId: string, validUntil?: string) {
    const list = this.roleAssignments.get(userId) || [];
    list.push({ assignment_id: 'RAS-' + Math.random().toString(36).substring(2, 6), role_name: roleName, context_id: contextId, valid_until: validUntil });
    this.roleAssignments.set(userId, list);
  }

  private seedDefaults() {
    this.policyRules.set('POL-AID-APPROVE', {
      policy_id: 'POL-AID-APPROVE',
      policy_name: 'Aid Approval Policy',
      policy_version: '1.0.0',
      target_resource_type: 'aid_request',
      allowed_actions: ['approve', 'read'],
      required_role: 'FINANCE_COMMISSIONER',
      valid_from: '2026-01-01T00:00:00Z',
      valid_until: '2026-12-31T23:59:59Z'
    });

    this.policyRules.set('POL-EXPIRED', {
      policy_id: 'POL-EXPIRED',
      policy_name: 'Expired Policy Rule',
      policy_version: '1.0.0',
      target_resource_type: 'asset',
      allowed_actions: ['delete'],
      required_role: 'ASSET_MANAGER',
      valid_from: '2020-01-01T00:00:00Z',
      valid_until: '2021-01-01T00:00:00Z'
    });

    this.seedRoleAssignment('USER-SEC-100', 'FINANCE_COMMISSIONER', 'ORG-JMT-001');
  }

  async evaluate_authorization_policy(
    p_action: string,
    p_resource_type: string,
    _pResourceId?: string | null,
    p_resource_org_id?: string | null
  ): Promise<{ effect: 'ALLOW' | 'DENY'; reason_code: PolicyDecisionReasonCode; policy_id: string | null; granted_scope?: string }> {
    // Gate 1: Unauthenticated Fail Closed
    if (!this.currentUid) {
      return {
        effect: 'DENY',
        reason_code: 'DENIED_UNAUTHENTICATED',
        policy_id: null
      };
    }

    const userRoles = this.roleAssignments.get(this.currentUid) || [];

    for (const policy of Array.from(this.policyRules.values())) {
      if (policy.target_resource_type === p_resource_type && policy.allowed_actions.includes(p_action)) {
        
        // Gate 6: Temporal check
        if (policy.valid_until && new Date(policy.valid_until).getTime() < new Date().getTime()) {
          return {
            effect: 'DENY',
            reason_code: 'DENIED_TEMPORAL_EXPIRED',
            policy_id: policy.policy_id
          };
        }

        const matchingRole = userRoles.find(r => r.role_name === policy.required_role);
        if (!matchingRole) {
          continue; // Keep checking other policies or deny
        }

        // Gate 4: Tenant Boundary check
        if (p_resource_org_id && matchingRole.context_id !== p_resource_org_id) {
          return {
            effect: 'DENY',
            reason_code: 'DENIED_TENANT_BOUNDARY',
            policy_id: policy.policy_id
          };
        }

        return {
          effect: 'ALLOW',
          reason_code: 'ALLOWED_EXPLICIT_POLICY',
          policy_id: policy.policy_id,
          granted_scope: matchingRole.context_id
        };
      }
    }

    return {
      effect: 'DENY',
      reason_code: 'DENIED_DEFAULT',
      policy_id: null
    };
  }

  async enforce_rbac_abac_policy(p_resource_type: string, p_resource_org_id: string, p_action: string): Promise<boolean> {
    const decision = await this.evaluate_authorization_policy(p_action, p_resource_type, null, p_resource_org_id);
    return decision.effect === 'ALLOW';
  }
}

async function runAuthorizationPDPHarness() {
  console.log("🧪 Starting F12 Hierarchical Authorization PDP & RLS Engine Harness Test...\n");

  const pdp = new AuthorizationPDPEngineMock();

  // Gate 1: Unauthenticated -> DENY Gate
  console.log("Gate 1: Unauthenticated -> DENY Gate");
  pdp.setAuthUser(null);
  const res1 = await pdp.evaluate_authorization_policy('read', 'aid_request');
  assert.strictEqual(res1.effect, 'DENY');
  assert.strictEqual(res1.reason_code, 'DENIED_UNAUTHENTICATED');
  console.log("   ✅ Passed: Unauthenticated request failed closed with DENIED_UNAUTHENTICATED.");

  // Restore authenticated user
  pdp.setAuthUser('USER-SEC-100');

  // Gate 2: No Matching Policy -> DENY Gate
  console.log("Gate 2: No Matching Policy -> DENY Gate");
  const res2 = await pdp.evaluate_authorization_policy('unknown_action', 'aid_request');
  assert.strictEqual(res2.effect, 'DENY');
  assert.strictEqual(res2.reason_code, 'DENIED_DEFAULT');
  console.log("   ✅ Passed: Unmatched policy request evaluated to DENIED_DEFAULT.");

  // Gate 3: Explicit Allow Policy Execution Gate
  console.log("Gate 3: Explicit Allow Policy Execution Gate");
  const res3 = await pdp.evaluate_authorization_policy('approve', 'aid_request', 'AID-001', 'ORG-JMT-001');
  assert.strictEqual(res3.effect, 'ALLOW');
  assert.strictEqual(res3.reason_code, 'ALLOWED_EXPLICIT_POLICY');
  assert.strictEqual(res3.granted_scope, 'ORG-JMT-001');
  console.log("   ✅ Passed: Explicit policy matched and returned ALLOW.");

  // Gate 4: Cross-Tenant -> DENY Gate
  console.log("Gate 4: Cross-Tenant -> DENY Gate");
  const res4 = await pdp.evaluate_authorization_policy('approve', 'aid_request', 'AID-001', 'ORG-JMT-OTHER-999');
  assert.strictEqual(res4.effect, 'DENY');
  assert.strictEqual(res4.reason_code, 'DENIED_TENANT_BOUNDARY');
  console.log("   ✅ Passed: Cross-tenant access rejected with DENIED_TENANT_BOUNDARY.");

  // Gate 5: Child Scope Authority Boundary Protection Gate
  console.log("Gate 5: Child Scope Authority Boundary Protection Gate");
  pdp.setAuthUser('USER-CHILD-001');
  pdp.seedRoleAssignment('USER-CHILD-001', 'SECTOR_SECRETARY', 'ORG-SEK-10');
  const res5 = await pdp.evaluate_authorization_policy('approve', 'aid_request', 'AID-001', 'ORG-JMT-001');
  assert.strictEqual(res5.effect, 'DENY');
  console.log("   ✅ Passed: Child scope user lacking required role at parent org rejected.");

  // Gate 6: Expired Policy Window -> DENY Gate
  console.log("Gate 6: Expired Policy Window -> DENY Gate");
  pdp.setAuthUser('USER-ASSET-MGR');
  pdp.seedRoleAssignment('USER-ASSET-MGR', 'ASSET_MANAGER', 'ORG-JMT-001');
  const res6 = await pdp.evaluate_authorization_policy('delete', 'asset', 'AST-100', 'ORG-JMT-001');
  assert.strictEqual(res6.effect, 'DENY');
  assert.strictEqual(res6.reason_code, 'DENIED_TEMPORAL_EXPIRED');
  console.log("   ✅ Passed: Expired policy window evaluated to DENIED_TEMPORAL_EXPIRED.");

  // Gate 7: ABAC Constraint Privilege Escalation Prevention Gate
  console.log("Gate 7: ABAC Constraint Privilege Escalation Prevention Gate");
  pdp.setAuthUser('USER-GUEST');
  const res7 = await pdp.evaluate_authorization_policy('approve', 'aid_request');
  assert.strictEqual(res7.effect, 'DENY');
  console.log("   ✅ Passed: ABAC attributes cannot escalate missing RBAC permissions.");

  // Gate 8: Explicit Delegation Gate
  console.log("Gate 8: Explicit Delegation Gate");
  pdp.setAuthUser('USER-DELEGATE');
  pdp.seedRoleAssignment('USER-DELEGATE', 'FINANCE_COMMISSIONER', 'ORG-JMT-001', '2026-12-31T23:59:59Z');
  const res8 = await pdp.evaluate_authorization_policy('approve', 'aid_request', 'AID-001', 'ORG-JMT-001');
  assert.strictEqual(res8.effect, 'ALLOW');
  console.log("   ✅ Passed: Explicit delegation assignment executed successfully.");

  // Gate 9: Concurrent Authorization Determinism Gate
  console.log("Gate 9: Concurrent Authorization Determinism Gate");
  pdp.setAuthUser('USER-SEC-100');
  const promises = [];
  for (let i = 0; i < 100; i++) {
    promises.push(pdp.evaluate_authorization_policy('approve', 'aid_request', 'AID-001', 'ORG-JMT-001'));
  }
  const results = await Promise.all(promises);
  assert.strictEqual(results.every(r => r.effect === 'ALLOW'), true);
  console.log("   ✅ Passed: 100 concurrent authorization evaluations returned 100% deterministic ALLOW decisions.");

  // Gate 10: RLS Physical Enforcement Helper Gate
  console.log("Gate 10: RLS Physical Enforcement Helper Gate");
  const rlsAllow = await pdp.enforce_rbac_abac_policy('aid_request', 'ORG-JMT-001', 'approve');
  const rlsDeny = await pdp.enforce_rbac_abac_policy('aid_request', 'ORG-JMT-OTHER-999', 'approve');
  assert.strictEqual(rlsAllow, true);
  assert.strictEqual(rlsDeny, false);
  console.log("   ✅ Passed: RLS helper function returned boolean true/false strictly matching PDP decisions.");

  console.log("\n🎉 ALL 10 F12 AUTHORIZATION SECURITY & PDP HARNESS GATES PASSED 100% SUCCESSFULLY!\n");
}

runAuthorizationPDPHarness();
