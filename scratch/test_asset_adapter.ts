import * as assert from 'assert';
import { UnifiedAssetData } from '../src/types/asset.types';
import { adaptAssetToViewModel } from '../src/adapters/assetViewModelAdapter';

function createMockAssetData(overrides: Partial<UnifiedAssetData> = {}): UnifiedAssetData {
  const base: UnifiedAssetData = {
    id_asset: 'TANAH-001',
    identity: {
      id_asset: 'TANAH-001',
      kategori: 'tanah',
      nama_aset: 'Aset Tanah Gereja Immanuel'
    },
    ownership: {
      id_pos: '01-10-YB',
      nama_organisasi: 'GPIB Jemaat Immanuel',
      org_level: 'JEMAAT_INDUK'
    },
    physical: {
      luas_m2: 1500,
      fungsi: null,
      nama_bangunan: null,
      jenis: null,
      merk_tipe: null,
      thn_perolehan: 1980,
      thn_berdiri: null,
      kondisi: 'Baik'
    },
    location: {
      alamat: 'Jl. Medan Merdeka Barat No. 10',
      latitude: -6.175392,
      longitude: 106.827153
    },
    valuation: {
      nilai_est: 5000000000,
      nilai_buku: 4500000000,
      sumber_dana: 'Hibah Jemaat'
    },
    legal: {
      status_hukum: 'Sertifikat Hak Milik',
      no_sertifikat: 'SHM-12345-GPIB',
      lampiran_files: [
        { id_lampiran: 'L-01', nama_file: 'Sertifikat.pdf', url: 'http://example.com/sertifikat.pdf', file_type: 'application/pdf' }
      ]
    },
    context: {
      requester_access_level: 'FULL_ADMIN',
      is_same_ancestral_tree: true
    },
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        physical: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        location: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        valuation: { accessible: true, visibility: 'RESTRICTED' },
        legal: { accessible: true, visibility: 'RESTRICTED' }
      }
    }
  };

  return { ...base, ...overrides };
}

function runAssetAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptAssetToViewModel...\n");

  // Test 1: Full Context Mapping (DATA States)
  console.log("Test 1: Full Context ViewModel Mapping (DATA States)");
  const fullAsset = createMockAssetData();
  const vmFull = adaptAssetToViewModel(fullAsset);

  assert.strictEqual(vmFull.id_asset, 'TANAH-001');
  assert.strictEqual(vmFull.overview.namaAset.type, 'DATA');
  assert.strictEqual((vmFull.overview.namaAset as any).value, 'Aset Tanah Gereja Immanuel');
  assert.strictEqual(vmFull.physical.luasM2.type, 'DATA');
  assert.strictEqual((vmFull.physical.luasM2 as any).value, 1500);
  assert.strictEqual(vmFull.valuation.nilaiEst.type, 'DATA');
  assert.strictEqual(vmFull.legal.statusHukum.type, 'DATA');
  console.log("   ✅ Passed: Full context data correctly mapped to DATA states.");

  // Test 2: Restricted Node Privacy Masking (PRIVACY_MASKED)
  console.log("Test 2: Restricted Node Privacy Masking (PRIVACY_MASKED)");
  const restrictedAsset = createMockAssetData({
    valuation: null,
    legal: null,
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        physical: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        location: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        valuation: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' },
        legal: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' }
      }
    }
  });

  const vmRestricted = adaptAssetToViewModel(restrictedAsset);
  assert.strictEqual(vmRestricted.physical.luasM2.type, 'DATA');
  assert.strictEqual(vmRestricted.valuation.nilaiEst.type, 'PRIVACY_MASKED');
  assert.strictEqual((vmRestricted.valuation.nilaiEst as any).reason, 'INSUFFICIENT_PERMISSION');
  assert.strictEqual(vmRestricted.legal.statusHukum.type, 'PRIVACY_MASKED');
  console.log("   ✅ Passed: Restricted valuation and legal nodes correctly masked to PRIVACY_MASKED.");

  // Test 3: Outside Context Privacy Masking
  console.log("Test 3: Outside Context Privacy Masking");
  const outsideAsset = createMockAssetData({
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        physical: { accessible: false, visibility: 'PUBLIC_WITHIN_CONTEXT', reason: 'OUTSIDE_CONTEXT' },
        location: { accessible: false, visibility: 'PUBLIC_WITHIN_CONTEXT', reason: 'OUTSIDE_CONTEXT' },
        valuation: { accessible: false, visibility: 'RESTRICTED', reason: 'OUTSIDE_CONTEXT' },
        legal: { accessible: false, visibility: 'RESTRICTED', reason: 'OUTSIDE_CONTEXT' }
      }
    }
  });

  const vmOutside = adaptAssetToViewModel(outsideAsset);
  assert.strictEqual(vmOutside.physical.luasM2.type, 'PRIVACY_MASKED');
  assert.strictEqual((vmOutside.physical.luasM2 as any).reason, 'OUTSIDE_CONTEXT');
  assert.strictEqual(vmOutside.location.alamat.type, 'PRIVACY_MASKED');
  console.log("   ✅ Passed: Outside context correctly masked across restricted & context nodes.");

  // Test 4: EMPTY vs PRIVACY_MASKED Invariant Assertion
  console.log("Test 4: EMPTY vs PRIVACY_MASKED Invariant Assertion");
  const emptyAsset = createMockAssetData({
    legal: {
      status_hukum: null,
      no_sertifikat: null,
      lampiran_files: []
    },
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        physical: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        location: { accessible: true, visibility: 'PUBLIC_WITHIN_CONTEXT' },
        valuation: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' }, // INACCESSIBLE
        legal: { accessible: true, visibility: 'RESTRICTED' } // ACCESSIBLE + NULL/EMPTY
      }
    }
  });

  const vmEmpty = adaptAssetToViewModel(emptyAsset);
  assert.strictEqual(vmEmpty.legal.lampiranFiles.type, 'EMPTY', "Accessible + empty array MUST resolve to EMPTY");
  assert.strictEqual(vmEmpty.valuation.nilaiEst.type, 'PRIVACY_MASKED', "Accessible=false MUST resolve to PRIVACY_MASKED");
  console.log("   ✅ Passed: Invariant verified (accessible+empty = EMPTY, inaccessible = PRIVACY_MASKED).");

  console.log("\n🎉 ALL ASSET ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runAssetAdapterUnitTests();
