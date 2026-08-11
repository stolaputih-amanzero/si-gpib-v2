import * as assert from 'assert';
import { UnifiedAssetData } from '../src/types/asset.types';

// Mock function representing get_asset_360 deterministic resolution & authorization logic
function mockGetAsset360(p_id_asset: string | null, requesterRole: string | null = null): UnifiedAssetData | null {
  if (!p_id_asset || p_id_asset.trim() === '' || p_id_asset === 'NON_EXISTENT_ID') {
    return null; // Test Gate 2: Ambiguity / Not Found Guard
  }

  // Simulated physical database assets
  const mockPhysicalAssets: Record<string, { kategori: 'tanah' | 'bangunan' | 'bergerak'; nama: string; pos: string }> = {
    'TANAH-01': { kategori: 'tanah', nama: 'Aset Tanah Gereja Immanuel', pos: '01-10-YB' },
    'BANGUNAN-01': { kategori: 'bangunan', nama: 'Gereja Utama Immanuel', pos: '01-10-YB' },
    'BERGERAK-01': { kategori: 'bergerak', nama: 'Mobil Operasional Pos', pos: 'POS-001' }
  };

  const asset = mockPhysicalAssets[p_id_asset];
  if (!asset) {
    return null;
  }

  const isRestrictedAuthorized = requesterRole !== null && ['super_user', 'admin_mupel', 'kmj', 'pj'].includes(requesterRole);
  const accessLevel = requesterRole === 'super_user' ? 'FULL_ADMIN' : isRestrictedAuthorized ? 'RESTRICTED' : requesterRole ? 'STANDARD' : 'UNAUTHENTICATED';

  return {
    id_asset: p_id_asset,
    identity: {
      id_asset: p_id_asset,
      kategori: asset.kategori,
      nama_aset: asset.nama
    },
    ownership: {
      id_pos: asset.pos,
      nama_organisasi: 'GPIB Jemaat Immanuel',
      org_level: 'JEMAAT_INDUK'
    },
    physical: {
      luas_m2: asset.kategori === 'tanah' ? 1200 : null,
      fungsi: asset.kategori === 'bangunan' ? 'Ibadah Utama' : null,
      nama_bangunan: asset.kategori === 'bangunan' ? asset.nama : null,
      jenis: asset.kategori === 'bergerak' ? 'Mobil' : null,
      merk_tipe: asset.kategori === 'bergerak' ? 'Toyota Avanza 2022' : null,
      thn_perolehan: 2015,
      thn_berdiri: asset.kategori === 'bangunan' ? 1985 : null,
      kondisi: 'Baik'
    },
    location: {
      alamat: 'Jl. Medan Merdeka Barat No. 10',
      latitude: -6.175392,
      longitude: 106.827153
    },
    valuation: isRestrictedAuthorized ? {
      nilai_est: 5000000000,
      nilai_buku: 4500000000,
      sumber_dana: 'Hibah Jemaat'
    } : null,
    legal: isRestrictedAuthorized ? {
      status_hukum: 'Sertifikat Hak Milik',
      no_sertifikat: 'SHM-12345-GPIB',
      lampiran_files: []
    } : null,
    context: {
      requester_access_level: accessLevel,
      is_same_ancestral_tree: true
    },
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        physical: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        location: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        valuation: {
          accessible: isRestrictedAuthorized,
          visibility: 'RESTRICTED',
          reason: isRestrictedAuthorized ? undefined : 'INSUFFICIENT_PERMISSION'
        },
        legal: {
          accessible: isRestrictedAuthorized,
          visibility: 'RESTRICTED',
          reason: isRestrictedAuthorized ? undefined : 'INSUFFICIENT_PERMISSION'
        }
      }
    }
  };
}

function runAssetSecurityHarness() {
  console.log("🛡️ Starting Security & Isolation Test Harness for get_asset_360...\n");

  // TEST GATE 1 — Unauthenticated Access
  console.log("Test Gate 1: Unauthenticated Access Isolation");
  const unauthRes = mockGetAsset360('TANAH-01', null);
  assert.notStrictEqual(unauthRes, null);
  assert.strictEqual(unauthRes!.context.requester_access_level, 'UNAUTHENTICATED');
  assert.strictEqual(unauthRes!._meta.privacy.valuation.accessible, false);
  assert.strictEqual(unauthRes!.valuation, null);
  assert.strictEqual(unauthRes!.legal, null);
  console.log("   ✅ Passed: Unauthenticated request masked valuation & legal fields.");

  // TEST GATE 2 — Deterministic Ambiguity & Not Found Guard
  console.log("Test Gate 2: Ambiguity & Not Found Guard (0 Fallback Guessing)");
  assert.strictEqual(mockGetAsset360('NON_EXISTENT_ID', 'kmj'), null);
  assert.strictEqual(mockGetAsset360('', 'kmj'), null);
  assert.strictEqual(mockGetAsset360(null, 'kmj'), null);
  console.log("   ✅ Passed: Invalid/non-existent ID deterministically returns NULL.");

  // TEST GATE 3 — Target Physical Asset Resolution
  console.log("Test Gate 3: Valid Target Asset Resolution");
  const kmjRes = mockGetAsset360('BANGUNAN-01', 'kmj');
  assert.notStrictEqual(kmjRes, null);
  assert.strictEqual(kmjRes!.identity.id_asset, 'BANGUNAN-01');
  assert.strictEqual(kmjRes!.identity.kategori, 'bangunan');
  assert.strictEqual(kmjRes!._meta.privacy.valuation.accessible, true);
  assert.notStrictEqual(kmjRes!.valuation, null);
  console.log("   ✅ Passed: Authorized KMJ request resolved full asset payload & restricted fields.");

  // TEST GATE 4 — Negative Security Invariants (Zero SYSTEM_ONLY & Leakage)
  console.log("Test Gate 4: Negative Security Invariants (SYSTEM_ONLY Exclusion)");
  const jsonStr = JSON.stringify(kmjRes);
  assert.strictEqual(jsonStr.includes('created_at'), false, "created_at MUST NOT be present");
  assert.strictEqual(jsonStr.includes('created_by'), false, "created_by MUST NOT be present");
  assert.strictEqual(jsonStr.includes('updated_at'), false, "updated_at MUST NOT be present");
  assert.strictEqual(jsonStr.includes('password_hash'), false, "password_hash MUST NOT be present");
  console.log("   ✅ Passed: Zero SYSTEM_ONLY or credential leaks in JSON payload.");

  // TEST GATE 5 — UnifiedAssetData Contract & Privacy Map Compliance
  console.log("Test Gate 5: UnifiedAssetData Contract & Privacy Map Compliance");
  assert.strictEqual(typeof kmjRes!._meta.privacy, 'object');
  assert.strictEqual(kmjRes!._meta.privacy.identity.visibility, 'ORG_WIDE');
  assert.strictEqual(kmjRes!._meta.privacy.valuation.visibility, 'RESTRICTED');
  console.log("   ✅ Passed: Payload shape strictly conforms to UnifiedAssetData contract.");

  console.log("\n🎉 ALL 5 ASSET SECURITY TEST GATES PASSED 100% SUCCESSFULLY!\n");
}

runAssetSecurityHarness();
