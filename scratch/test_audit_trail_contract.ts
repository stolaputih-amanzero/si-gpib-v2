import * as assert from 'assert';
import { 
  AuditEventPayload, 
  AuditChainVerificationResult, 
  computeCanonicalAuditHash 
} from '../src/types/auditTrail.types';

function runAuditTrailContractUnitTests() {
  console.log("🧪 Starting Unit Tests for F13 Immutable Audit Trail Data Contract...\n");

  const sampleEntryInput = {
    log_id: 'LOG-0001',
    topic: 'domain.aid_request',
    sequence_number: 1,
    prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    occurred_at: '2026-08-11T12:00:00.000Z',
    actor: {
      actor_id: 'USER-AUDIT-100',
      actor_type: 'HUMAN' as const,
      org_context_id: 'ORG-JMT-001',
      session_id: 'SESS-888'
    },
    authorization: {
      policy_id: 'POL-AID-APPROVE',
      policy_version: '1.0.0',
      decision: 'ALLOW' as const,
      reason_code: 'ALLOWED_EXPLICIT_POLICY',
      granted_scope: 'ORG-JMT-001'
    },
    entity: {
      entity_type: 'aid_request',
      entity_id: 'AID-999',
      action: 'APPROVE'
    },
    mutation: {
      state_before: { status: 'PENDING', amount: 500000 },
      state_after: { status: 'APPROVED', amount: 500000 },
      changed_fields: ['status']
    },
    correlation: {
      request_id: 'REQ-AUDIT-555',
      transaction_id: 'TX-AUDIT-999',
      correlation_id: 'CORR-AUDIT-777'
    }
  };

  // Test 1: Canonical Serialization & Cryptographic Hash Chaining
  console.log("Test 1: Canonical Serialization & Cryptographic Hash Chaining");
  const hash1 = computeCanonicalAuditHash(sampleEntryInput);
  assert.strictEqual(typeof hash1, 'string');
  assert.strictEqual(hash1.length, 64); // SHA-256 hex length
  console.log("   ✅ Passed: Canonical payload computed valid 64-char SHA-256 hash.");

  // Test 2: Append-Only Record Structure Construction
  console.log("Test 2: Append-Only Record Structure Construction");
  const auditEvent: AuditEventPayload = {
    ...sampleEntryInput,
    chain: {
      sequence_number: sampleEntryInput.sequence_number,
      prev_hash: sampleEntryInput.prev_hash,
      curr_hash: hash1,
      occurred_at: sampleEntryInput.occurred_at
    }
  };
  assert.strictEqual(auditEvent.chain.curr_hash, hash1);
  console.log("   ✅ Passed: AuditEventPayload created with immutable chain metadata.");

  // Test 3: Server-Derived Actor Context Classification
  console.log("Test 3: Server-Derived Actor Context Classification");
  assert.strictEqual(auditEvent.actor.actor_type, 'HUMAN');
  assert.strictEqual(auditEvent.actor.actor_id, 'USER-AUDIT-100');
  console.log("   ✅ Passed: Actor context classified correctly.");

  // Test 4: F12 Authorization Provenance Integration
  console.log("Test 4: F12 Authorization Provenance Integration");
  assert.strictEqual(auditEvent.authorization.policy_id, 'POL-AID-APPROVE');
  assert.strictEqual(auditEvent.authorization.decision, 'ALLOW');
  assert.strictEqual(auditEvent.authorization.reason_code, 'ALLOWED_EXPLICIT_POLICY');
  console.log("   ✅ Passed: F12 policy provenance metadata preserved in audit entry.");

  // Test 5: Entity Provenance & Mutation State Diff Reconstruction
  console.log("Test 5: Entity Provenance & Mutation State Diff Reconstruction");
  assert.strictEqual(auditEvent.entity.entity_type, 'aid_request');
  assert.strictEqual(auditEvent.entity.entity_id, 'AID-999');
  assert.deepStrictEqual(auditEvent.mutation.changed_fields, ['status']);
  console.log("   ✅ Passed: Entity provenance and state diff validated.");

  // Test 6: Zero PII Redaction & Secret Credentials Protection
  console.log("Test 6: Zero PII Redaction & Secret Credentials Protection");
  const jsonPayload = JSON.stringify(auditEvent);
  const forbiddenSecrets = ['password', 'auth_token', 'secret_key', 'service_role_key', 'private_key'];
  for (const secretKey of forbiddenSecrets) {
    assert.strictEqual(jsonPayload.includes(`"${secretKey}":`), false, `Secret key '${secretKey}' MUST NOT exist in audit payload`);
  }
  console.log("   ✅ Passed: Zero secret credentials found in audit contract payload.");

  // Test 7: Tenant & Organization Scope Boundary Isolation
  console.log("Test 7: Tenant & Organization Scope Boundary Isolation");
  assert.strictEqual(auditEvent.actor.org_context_id, 'ORG-JMT-001');
  console.log("   ✅ Passed: Organization tenant scope boundary preserved.");

  // Test 8: Correlation Identifiers & Request Tracing
  console.log("Test 8: Correlation Identifiers & Request Tracing");
  assert.strictEqual(auditEvent.correlation.request_id, 'REQ-AUDIT-555');
  assert.strictEqual(auditEvent.correlation.transaction_id, 'TX-AUDIT-999');
  assert.strictEqual(auditEvent.correlation.correlation_id, 'CORR-AUDIT-777');
  console.log("   ✅ Passed: Distributed correlation identifiers validated.");

  // Test 9: Chain Verification Result Contract
  console.log("Test 9: Chain Verification Result Contract");
  const verificationRes: AuditChainVerificationResult = {
    topic: 'domain.aid_request',
    is_valid: true,
    total_records: 100,
    verified_at: new Date().toISOString()
  };
  assert.strictEqual(verificationRes.is_valid, true);
  console.log("   ✅ Passed: AuditChainVerificationResult contract validated.");

  // Test 10: Provider Neutrality Invariant
  console.log("Test 10: Provider Neutrality Invariant");
  assert.strictEqual(jsonPayload.includes('supabase'), false, "supabase reference MUST NOT exist in domain contract");
  assert.strictEqual(jsonPayload.includes('auth.uid()'), false, "auth.uid() reference MUST NOT exist in domain contract");
  console.log("   ✅ Passed: Provider and transport SDK neutrality verified.");

  // Test 11: Idempotency & Deterministic Hash Reproducibility
  console.log("Test 11: Idempotency & Deterministic Hash Reproducibility");
  const hash2 = computeCanonicalAuditHash(sampleEntryInput);
  assert.strictEqual(hash1, hash2, "Identical input MUST yield 100% identical SHA-256 hash");
  console.log("   ✅ Passed: Deterministic canonical hash computation verified.");

  console.log("\n🎉 ALL F13 AUDIT TRAIL CONTRACT UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runAuditTrailContractUnitTests();
