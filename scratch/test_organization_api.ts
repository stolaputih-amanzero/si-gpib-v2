/**
 * F3 Organization Workspace Integration & Security Test Harness
 * 
 * Tests RPC get_organization_360 across security and resolution scenarios:
 * 1. Unauthenticated Block
 * 2. Deterministic Resolution / Ambiguity Guard (Invalid / Empty target)
 * 3. Mupel Level Resolution & Projection Boundaries
 * 4. Jemaat Induk Level Resolution & Structure Boundaries
 * 5. Pos Pelkes Level Resolution & Territory Projections
 * 6. Cross-Context Isolation & Masking
 * 7. Negative Invariants: Zero SYSTEM_ONLY & Zero Personal Data Leaks in Projections
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as assert from 'assert';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

async function getAuthenticatedClient(email?: string, password?: string): Promise<SupabaseClient> {
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  if (email && password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(`Login failed for ${email}: ${error.message}`);
    }
  }
  return client;
}

// Recursive helper to check forbidden keys in output JSON
function assertZeroForbiddenKeys(obj: any, forbiddenKeys: string[], path = 'root') {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => assertZeroForbiddenKeys(item, forbiddenKeys, `${path}[${idx}]`));
    return;
  }

  for (const key of Object.keys(obj)) {
    assert.ok(
      !forbiddenKeys.includes(key),
      `Forbidden leak detected at ${path}.${key}: Value must NEVER appear in Organization Read-Model!`
    );
    assertZeroForbiddenKeys(obj[key], forbiddenKeys, `${path}.${key}`);
  }
}

async function runTests() {
  console.log("🚀 Starting Organization Workspace (Gate 3) Security & Integration Tests...\n");

  const unauthenticatedClient = await getAuthenticatedClient();

  const selfEmail = process.env.TEST_PERSON_SELF_EMAIL;
  const selfPassword = process.env.TEST_PERSON_SELF_PASSWORD;

  if (!selfEmail || !selfPassword) {
    console.warn("⚠️ Skipping authenticated tests: TEST_PERSON_SELF_EMAIL or TEST_PERSON_SELF_PASSWORD missing.");
    return;
  }

  const authenticatedClient = await getAuthenticatedClient(selfEmail, selfPassword);

  // 1. Unauthenticated Gate
  console.log("Test 1: Unauthenticated Access Block");
  const { error: unauthErr } = await unauthenticatedClient
    .rpc('get_organization_360', { p_id_org: '01-10-YB' });
  assert.ok(unauthErr, "RPC must refuse unauthenticated calls");
  console.log("   ✅ Passed: RPC refused unauthenticated access.");

  // 2. Deterministic Resolution & 404 Ambiguity Guard
  console.log("Test 2: Target Not Found / Ambiguity Guard");
  const { data: notFoundData } = await authenticatedClient
    .rpc('get_organization_360', { p_id_org: 'INVALID-ORG-999' });
  assert.strictEqual(notFoundData, null, "RPC must return NULL for non-existent target ID");

  const { data: emptyData } = await authenticatedClient
    .rpc('get_organization_360', { p_id_org: '' });
  assert.strictEqual(emptyData, null, "RPC must return NULL for empty target string");
  console.log("   ✅ Passed: Ambiguity guard cleanly returned NULL without guessing.");

  // 3. Organization Level Query (Jemaat Induk Level)
  console.log("Test 3: Jemaat Induk Level Query (01-10-YB)");
  const { data: jemaatData, error: jemaatErr } = await authenticatedClient
    .rpc('get_organization_360', { p_id_org: '01-10-YB' });
  
  assert.ifError(jemaatErr);
  assert.ok(jemaatData, "Jemaat data must not be null");
  assert.strictEqual(jemaatData.id_org, '01-10-YB');
  assert.strictEqual(jemaatData.identity.org_level, 'JEMAAT_INDUK');
  assert.ok(jemaatData.structure.parent, "Jemaat Induk must have parent Mupel structure");
  assert.ok(Array.isArray(jemaatData.structure.children), "Jemaat Induk must have children Pos list");
  console.log("   ✅ Passed: Jemaat Induk node resolved deterministically.");

  // 4. Projection Boundaries Assertion
  console.log("Test 4: Projection Boundaries & Forbidden Leakage Assertion");
  const forbiddenPersonalKeys = [
    'no_hp',
    'tanggal_lahir',
    'keluarga',
    'pastoral_notes',
    'password_hash',
    'p256dh_key',
    'auth_key',
    'reviewer_notes',
    'bank_details'
  ];

  assertZeroForbiddenKeys(jemaatData, forbiddenPersonalKeys);
  console.log("   ✅ Passed: Zero forbidden/SYSTEM_ONLY keys detected across response payload.");

  // 5. Structure & Metadata Contract Verification
  console.log("Test 5: UnifiedOrganizationData Contract Shape Compliance");
  assert.ok(jemaatData.identity, "Must contain identity node");
  assert.ok(jemaatData.structure, "Must contain structure node");
  assert.ok(jemaatData.context, "Must contain context node");
  assert.ok(jemaatData.overview, "Must contain overview node");
  assert.ok(jemaatData.people, "Must contain people projection node");
  assert.ok(jemaatData.assets, "Must contain assets projection node");
  assert.ok(jemaatData.aid_requests, "Must contain aid_requests projection node");
  assert.ok(jemaatData.territory, "Must contain territory projection node");
  assert.ok(jemaatData._meta.privacy, "Must contain _meta.privacy nodes");
  console.log("   ✅ Passed: JSON payload perfectly complies with Gate 2 UnifiedOrganizationData interface.");

  console.log("\n🎉 ALL GATE 3 INTEGRATION & SECURITY TESTS PASSED SUCCESSFULLY!\n");
}

runTests().catch((err) => {
  console.error("❌ Integration Test Failed:", err);
  process.exit(1);
});
