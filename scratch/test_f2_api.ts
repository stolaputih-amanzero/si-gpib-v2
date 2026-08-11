/**
 * F2 Integration & Security Harness
 * 
 * Pengujian komprehensif terhadap RPC `get_person_360` dari ujung ke ujung:
 * (Auth -> PostgREST -> RPC -> UnifiedPersonData)
 * 
 * Penggunaan:
 * 1. Set environment variables:
 *    SUPABASE_URL=...
 *    SUPABASE_ANON_KEY=...
 *    TEST_PERSON_SELF_EMAIL=...
 *    TEST_PERSON_SELF_PASSWORD=...
 *    TEST_PERSON_SELF_ID=...
 *    
 *    TEST_PERSON_SAME_CONTEXT_EMAIL=...
 *    TEST_PERSON_SAME_CONTEXT_PASSWORD=...
 *    TEST_PERSON_SAME_CONTEXT_ID=...
 *    
 *    TEST_PERSON_OUTSIDE_CONTEXT_EMAIL=...
 *    TEST_PERSON_OUTSIDE_CONTEXT_PASSWORD=...
 * 
 * 2. Run: npx tsx scratch/test_f2_api.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as assert from 'assert';
import 'dotenv/config'; // Pastikan `dotenv` terinstal

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

// Helper untuk membuat client dan login
async function getAuthenticatedClient(email?: string, password?: string): Promise<SupabaseClient> {
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false } // Hindari interferensi session antar test
  });

  if (email && password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(`\n[!] Auth Error Details for ${email}:`, error);
      throw new Error(`Login failed for ${email}: ${error.message || JSON.stringify(error)}`);
    }
  }
  return client;
}

// Runner Utama
async function runTests() {
  console.log("🚀 Starting F2 API Security & Integration Tests...\n");

  const unauthenticatedClient = await getAuthenticatedClient();

  const selfEmail = process.env.TEST_PERSON_SELF_EMAIL;
  const selfPassword = process.env.TEST_PERSON_SELF_PASSWORD;
  const selfPersonId = process.env.TEST_PERSON_SELF_ID;

  const sameCtxEmail = process.env.TEST_PERSON_SAME_CONTEXT_EMAIL;
  const sameCtxPassword = process.env.TEST_PERSON_SAME_CONTEXT_PASSWORD;

  const outsideCtxEmail = process.env.TEST_PERSON_OUTSIDE_CONTEXT_EMAIL;
  const outsideCtxPassword = process.env.TEST_PERSON_OUTSIDE_CONTEXT_PASSWORD;

  if (!selfEmail || !selfPassword || !selfPersonId) {
    console.warn("⚠️  Skipping tests: Env variables for test personas are missing.");
    return;
  }

  const selfClient = await getAuthenticatedClient(selfEmail, selfPassword);
  const sameCtxClient = await getAuthenticatedClient(sameCtxEmail, sameCtxPassword);
  const outsideCtxClient = await getAuthenticatedClient(outsideCtxEmail, outsideCtxPassword);

  // -----------------------------------------------------
  // 1. Authentication Gate (Unauthenticated → Unauthorized)
  // -----------------------------------------------------
  console.log("Test 1: Unauthenticated Client");
  const { error: unauthError } = await unauthenticatedClient
    .rpc('get_person_360', { p_id_person: selfPersonId });
  
  assert.ok(unauthError, "Should return error when unauthenticated");
  // Periksa apakah PostgREST memberikan HTTP 401 atau equivalent (bergantung pada exception RPC)
  console.log("   ✅ Passed: RPC refused unauthenticated access.");

  // -----------------------------------------------------
  // 2. Target Resolution (Invalid ID → NULL/404)
  // -----------------------------------------------------
  console.log("Test 2: Target Not Found");
  const invalidUUID = "00000000-0000-0000-0000-000000000000";
  const { data: notFoundData } = await selfClient
    .rpc('get_person_360', { p_id_person: invalidUUID });
  
  // Karena return NULL, PostgREST / Supabase JS biasanya me-return data = null
  assert.strictEqual(notFoundData, null, "Should return null for non-existent person");
  console.log("   ✅ Passed: RPC gracefully returned NULL for non-existent target.");

  // -----------------------------------------------------
  // 3. Self (PRIVATE → accessible)
  // -----------------------------------------------------
  console.log("Test 3: Self Access (Full Privileges)");
  const { data: selfData } = await selfClient
    .rpc('get_person_360', { p_id_person: selfPersonId });
  
  assert.ok(selfData, "Self data must not be null");
  // Assert PrivacyState for PRIVATE data
  assert.strictEqual(selfData.profile._meta.keluarga.accessible, true, "Self should see family");
  assert.strictEqual(selfData.profile._meta.keluarga.visibility, 'PRIVATE', "Family is PRIVATE");
  assert.strictEqual(selfData.pastoral._meta.notes.accessible, true, "Self should see pastoral notes");
  console.log("   ✅ Passed: Self can access PRIVATE scope.");

  // -----------------------------------------------------
  // 4. Same Context (PUBLIC → visible, RESTRICTED/PRIVATE → masked)
  // -----------------------------------------------------
  console.log("Test 4: Same Context Access");
  if (sameCtxClient) {
    const { data: sameCtxData } = await sameCtxClient
      .rpc('get_person_360', { p_id_person: selfPersonId });
    
    assert.ok(sameCtxData, "Same Ctx data must not be null");
    
    // PUBLIC_WITHIN_CONTEXT
    assert.strictEqual(sameCtxData.overview._meta.is_active.accessible, true, "Same context should see PUBLIC_WITHIN_CONTEXT");
    
    // RESTRICTED
    assert.strictEqual(sameCtxData.profile._meta.no_hp.accessible, false, "Same context cannot see RESTRICTED (if not Mupel Admin)");
    assert.strictEqual(sameCtxData.profile.data.no_hp, null, "RESTRICTED field must be nulled out");
    assert.strictEqual(sameCtxData.profile._meta.no_hp.reason, 'INSUFFICIENT_PERMISSION');

    // PRIVATE
    assert.strictEqual(sameCtxData.profile._meta.keluarga.accessible, false, "Same context cannot see PRIVATE");
    assert.strictEqual(sameCtxData.profile.data.keluarga, null, "PRIVATE field must be nulled out");
    assert.strictEqual(sameCtxData.profile._meta.keluarga.reason, 'INSUFFICIENT_PERMISSION');
    
    console.log("   ✅ Passed: Same Context correctly masked RESTRICTED and PRIVATE.");
  } else {
    console.log("   ⏭️ Skipped (No credentials for Same Context)");
  }

  // -----------------------------------------------------
  // 5. Outside Context (ORG_WIDE → visible, Others → masked)
  // -----------------------------------------------------
  console.log("Test 5: Outside Context Access");
  if (outsideCtxClient) {
    const { data: outsideCtxData } = await outsideCtxClient
      .rpc('get_person_360', { p_id_person: selfPersonId });
    
    assert.ok(outsideCtxData, "Outside Ctx data must not be null");
    
    // ORG_WIDE
    assert.ok(outsideCtxData.identity.nama_lengkap, "ORG_WIDE data should be visible");
    
    // PUBLIC_WITHIN_CONTEXT
    assert.strictEqual(outsideCtxData.overview._meta.is_active.accessible, false, "Outside context cannot see PUBLIC_WITHIN_CONTEXT");
    assert.strictEqual(outsideCtxData.overview.is_active, null, "Field must be nulled out");
    assert.strictEqual(outsideCtxData.overview._meta.is_active.reason, 'OUTSIDE_CONTEXT');

    // RESTRICTED
    assert.strictEqual(outsideCtxData.profile._meta.no_hp.accessible, false, "Outside context cannot see RESTRICTED");
    assert.strictEqual(outsideCtxData.profile._meta.no_hp.reason, 'OUTSIDE_CONTEXT');
    
    console.log("   ✅ Passed: Outside Context correctly masked PUBLIC_WITHIN_CONTEXT and RESTRICTED.");
  } else {
    console.log("   ⏭️ Skipped (No credentials for Outside Context)");
  }

  // -----------------------------------------------------
  // 6. Pagination Clamp & SYSTEM_ONLY Invariant
  // -----------------------------------------------------
  console.log("Test 6: Pagination & SYSTEM_ONLY Guardrails");
  const { data: pagData } = await selfClient
    .rpc('get_person_360', { 
      p_id_person: selfPersonId, 
      p_pastoral_limit: 999999, // Ekstrem limit
      p_pastoral_offset: -5     // Ekstrem offset
    });
  
  assert.ok(pagData, "Data should be returned");
  assert.ok(pagData.pastoral.pagination.pastoral_logs.limit <= 100, "Limit should be clamped to max 100");
  assert.strictEqual(pagData.pastoral.pagination.pastoral_logs.offset, 0, "Negative offset should be clamped to 0");
  
  // Memastikan SYSTEM_ONLY tidak ada di response sama sekali
  const jsonStr = JSON.stringify(pagData);
  assert.ok(!jsonStr.includes('SYSTEM_ONLY'), "SYSTEM_ONLY must NEVER be exposed in the response");
  
  console.log("   ✅ Passed: Pagination clamped and SYSTEM_ONLY invariant maintained.");

  console.log("\n🎉 All integration and security gates passed successfully!");
}

runTests().catch(console.error);
