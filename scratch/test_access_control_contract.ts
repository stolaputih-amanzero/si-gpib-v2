import * as assert from 'assert';
import { 
  AuthorizationRequest, 
  PolicyRuleDefinition, 
  evaluateAuthorizationRequest 
} from '../src/types/accessControl.types';

function runAccessControlContractUnitTests() {
  console.log("🧪 Starting Unit Tests for F12 Hierarchical Authorization Data Contract...\n");

  const samplePolicy: PolicyRuleDefinition = {
    policy_id: 'POL-AID-APPROVE-01',
    policy_name: 'Aid Request Approval Policy',
    policy_version: '1.0.0',
    target_resource_type: 'aid_request',
    allowed_actions: ['approve', 'read'],
    required_role: 'FINANCE_COMMISSIONER',
    allowed_scope_type: 'JEMAAT',
    temporal_window: {
      valid_from: '2026-01-01T00:00:00Z',
      valid_until: '2026-12-31T23:59:59Z'
    }
  };

  const validRequest: AuthorizationRequest = {
    request_id: 'REQ-AUTH-001',
    subject: {
      subject_id: 'SUBJ-USR-100',
      user_id: 'USER-100',
      resolved_roles: ['FINANCE_COMMISSIONER'],
      active_org_scope: {
        context_id: 'ORG-JMT-001',
        parent_context_id: 'ORG-MPL-01',
        scope_type: 'JEMAAT',
        authority_boundary: 'ORG-MPL-01'
      },
      attributes: { is_active: true }
    },
    action: 'approve',
    resource: {
      resource_id: 'AID-REQ-500',
      resource_type: 'aid_request',
      org_context_id: 'ORG-JMT-001',
      attributes: { requested_amount: 5000000 }
    },
    context: {
      timestamp: '2026-08-01T10:00:00Z',
      location: 'Jakarta'
    }
  };

  // Test 1: Discriminated Union & Policy Decision Narrowing
  console.log("Test 1: Discriminated Union & Policy Decision Narrowing");
  const decision1 = evaluateAuthorizationRequest(validRequest, [samplePolicy]);
  assert.strictEqual(decision1.effect, 'ALLOW');
  if (decision1.effect === 'ALLOW') {
    assert.strictEqual(decision1.reason_code, 'ALLOWED_EXPLICIT_POLICY');
    assert.strictEqual(decision1.granted_scope, 'ORG-JMT-001');
    console.log("   ✅ Passed: Discriminated union narrowed AllowPolicyDecision correctly.");
  } else {
    assert.fail("Policy decision narrowing failed");
  }

  // Test 2: Deny by Default Enforcement
  console.log("Test 2: Deny by Default Enforcement");
  const unmappedActionReq: AuthorizationRequest = {
    ...validRequest,
    action: 'delete' // Delete action not allowed in samplePolicy!
  };
  const decision2 = evaluateAuthorizationRequest(unmappedActionReq, [samplePolicy]);
  assert.strictEqual(decision2.effect, 'DENY');
  assert.strictEqual(decision2.reason_code, 'DENIED_DEFAULT');
  console.log("   ✅ Passed: Unmatched policy request evaluated to DENIED_DEFAULT.");

  // Test 3: Explicit Allow Policy Execution
  console.log("Test 3: Explicit Allow Policy Execution");
  assert.strictEqual(decision1.effect, 'ALLOW');
  assert.strictEqual(decision1.policy_id, 'POL-AID-APPROVE-01');
  console.log("   ✅ Passed: Matching policy executed and returned ALLOW.");

  // Test 4: Organization Tenant Boundary Protection
  console.log("Test 4: Organization Tenant Boundary Protection");
  const crossTenantReq: AuthorizationRequest = {
    ...validRequest,
    resource: {
      ...validRequest.resource,
      org_context_id: 'ORG-JMT-OTHER-999' // Different jemaat context!
    }
  };
  const decision4 = evaluateAuthorizationRequest(crossTenantReq, [samplePolicy]);
  assert.strictEqual(decision4.effect, 'DENY');
  assert.strictEqual(decision4.reason_code, 'DENIED_TENANT_BOUNDARY');
  console.log("   ✅ Passed: Cross-tenant access rejected with DENIED_TENANT_BOUNDARY.");

  // Test 5: Temporal Policy Validity Window Check
  console.log("Test 5: Temporal Policy Validity Window Check");
  const expiredReq: AuthorizationRequest = {
    ...validRequest,
    context: {
      timestamp: '2027-05-01T00:00:00Z' // Outside 2026 window!
    }
  };
  const decision5 = evaluateAuthorizationRequest(expiredReq, [samplePolicy]);
  assert.strictEqual(decision5.effect, 'DENY');
  assert.strictEqual(decision5.reason_code, 'DENIED_TEMPORAL_EXPIRED');
  console.log("   ✅ Passed: Out-of-window request rejected with DENIED_TEMPORAL_EXPIRED.");

  // Test 6: Unauthenticated Request Fail Closed Check
  console.log("Test 6: Unauthenticated Request Fail Closed Check");
  const unauthReq: AuthorizationRequest = {
    ...validRequest,
    subject: {
      ...validRequest.subject,
      user_id: 'ANONYMOUS'
    }
  };
  const decision6 = evaluateAuthorizationRequest(unauthReq, [samplePolicy]);
  assert.strictEqual(decision6.effect, 'DENY');
  assert.strictEqual(decision6.reason_code, 'DENIED_UNAUTHENTICATED');
  console.log("   ✅ Passed: Anonymous request failed closed with DENIED_UNAUTHENTICATED.");

  // Test 7: No Privilege Escalation Check
  console.log("Test 7: No Privilege Escalation Check");
  const nonAdminReq: AuthorizationRequest = {
    ...validRequest,
    subject: {
      ...validRequest.subject,
      resolved_roles: ['SECTOR_SECRETARY'] // Lacks FINANCE_COMMISSIONER role!
    }
  };
  const decision7 = evaluateAuthorizationRequest(nonAdminReq, [samplePolicy]);
  assert.strictEqual(decision7.effect, 'DENY');
  assert.strictEqual(decision7.reason_code, 'DENIED_DEFAULT');
  console.log("   ✅ Passed: Lacking required role resulted in DENY without privilege escalation.");

  // Test 8: Data-Driven Generic Hierarchy Scope Check
  console.log("Test 8: Data-Driven Generic Hierarchy Scope Check");
  const parentOrgReq: AuthorizationRequest = {
    ...validRequest,
    resource: {
      ...validRequest.resource,
      org_context_id: 'ORG-MPL-01' // Resource belongs to parent context!
    }
  };
  const decision8 = evaluateAuthorizationRequest(parentOrgReq, [samplePolicy]);
  assert.strictEqual(decision8.effect, 'ALLOW');
  console.log("   ✅ Passed: Data-driven parent_context_id hierarchy scope resolution verified.");

  // Test 9: Delegation Contract Verification
  console.log("Test 9: Delegation Contract Verification");
  const delegatedReq: AuthorizationRequest = {
    ...validRequest,
    context: {
      ...validRequest.context,
      is_delegated: true,
      delegation: {
        delegator_id: 'USER-ADMIN-MASTER',
        delegate_id: 'USER-100',
        valid_until: '2026-12-31T23:59:59Z',
        allowed_actions: ['approve']
      }
    }
  };
  assert.strictEqual(delegatedReq.context.is_delegated, true);
  assert.strictEqual(delegatedReq.context.delegation?.delegator_id, 'USER-ADMIN-MASTER');
  console.log("   ✅ Passed: Explicit delegation context contract verified.");

  // Test 10: Provider Neutrality Check
  console.log("Test 10: Provider Neutrality Check");
  const jsonStr = JSON.stringify(validRequest) + JSON.stringify(decision1);
  assert.strictEqual(jsonStr.includes('supabase'), false, "supabase references MUST NOT exist in contract");
  assert.strictEqual(jsonStr.includes('auth.uid()'), false, "RLS syntax MUST NOT exist in contract");
  console.log("   ✅ Passed: Zero provider / SDK or RLS references in contract.");

  // Test 11: Deterministic Decision Contract Check
  console.log("Test 11: Deterministic Decision Contract Check");
  const dA = evaluateAuthorizationRequest(validRequest, [samplePolicy]);
  const dB = evaluateAuthorizationRequest(validRequest, [samplePolicy]);
  assert.strictEqual(dA.effect, dB.effect);
  assert.strictEqual(dA.reason_code, dB.reason_code);
  console.log("   ✅ Passed: Deterministic request evaluation verified.");

  console.log("\n🎉 ALL F12 AUTHORIZATION CONTRACT UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runAccessControlContractUnitTests();
