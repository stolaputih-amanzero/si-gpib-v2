import * as assert from 'assert';
import { UnifiedAidRequestData } from '../src/types/aidRequest.types';
import { adaptAidRequestToViewModel } from '../src/adapters/aidRequestViewModelAdapter';

function createMockAidRequestData(overrides: Partial<UnifiedAidRequestData> = {}): UnifiedAidRequestData {
  const base: UnifiedAidRequestData = {
    id_ajuan: 'AJUAN-TEST-001',
    identity: {
      id_ajuan: 'AJUAN-TEST-001',
      jenis_bantuan: 'Perbaikan Atap Gereja',
      urgensi: 'Tinggi'
    },
    ownership: {
      id_pos: '01-10-YB',
      nama_organisasi: 'GPIB Jemaat Immanuel',
      org_level: 'POS_PELKES'
    },
    workflow: {
      status: 'Pending_KMJ',
      created_at: '2026-08-11T10:00:00Z'
    },
    proposal: {
      biaya: 25000000.00,
      keterangan: 'Atap bocor parah saat musim hujan',
      id_tanah: null,
      id_bangunan: 'BANGUNAN-01',
      id_aset_b: null
    },
    approval_history: [
      {
        id: 1,
        role_approver: 'user',
        aksi: 'submit',
        catatan: 'Pengajuan resmi dari Pos Pelkes',
        created_at: '2026-08-11T10:05:00Z'
      }
    ],
    context: {
      requester_access_level: 'FULL_ADMIN',
      is_same_ancestral_tree: true
    },
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        workflow: { accessible: true, visibility: 'ORG_WIDE' },
        proposal: { accessible: true, visibility: 'RESTRICTED' },
        approval_history: { accessible: true, visibility: 'RESTRICTED' }
      }
    }
  };

  return { ...base, ...overrides };
}

function runAidRequestAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptAidRequestToViewModel...\n");

  // Test 1: Full Context Mapping (DATA States)
  console.log("Test 1: Full Context ViewModel Mapping (DATA States)");
  const fullReq = createMockAidRequestData();
  const vmFull = adaptAidRequestToViewModel(fullReq);

  assert.strictEqual(vmFull.id_ajuan, 'AJUAN-TEST-001');
  assert.strictEqual(vmFull.overview.jenisBantuan.type, 'DATA');
  assert.strictEqual((vmFull.overview.jenisBantuan as any).value, 'Perbaikan Atap Gereja');
  assert.strictEqual(vmFull.proposal.biaya.type, 'DATA');
  assert.strictEqual((vmFull.proposal.biaya as any).value, 25000000.00);
  assert.strictEqual(vmFull.approvalHistory.items.type, 'DATA');
  assert.strictEqual((vmFull.approvalHistory.items as any).value.length, 1);
  console.log("   ✅ Passed: Full context data correctly mapped to DATA states.");

  // Test 2: Restricted Node Privacy Masking (PRIVACY_MASKED)
  console.log("Test 2: Restricted Node Privacy Masking (PRIVACY_MASKED)");
  const restrictedReq = createMockAidRequestData({
    proposal: null,
    approval_history: [],
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        workflow: { accessible: true, visibility: 'ORG_WIDE' },
        proposal: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' },
        approval_history: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' }
      }
    }
  });

  const vmRestricted = adaptAidRequestToViewModel(restrictedReq);
  assert.strictEqual(vmRestricted.overview.jenisBantuan.type, 'DATA');
  assert.strictEqual(vmRestricted.proposal.biaya.type, 'PRIVACY_MASKED');
  assert.strictEqual((vmRestricted.proposal.biaya as any).reason, 'INSUFFICIENT_PERMISSION');
  assert.strictEqual(vmRestricted.approvalHistory.items.type, 'PRIVACY_MASKED');
  console.log("   ✅ Passed: Restricted proposal and approval history nodes correctly masked to PRIVACY_MASKED.");

  // Test 3: Outside Context Privacy Masking
  console.log("Test 3: Outside Context Privacy Masking");
  const outsideReq = createMockAidRequestData({
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        workflow: { accessible: true, visibility: 'ORG_WIDE' },
        proposal: { accessible: false, visibility: 'RESTRICTED', reason: 'OUTSIDE_CONTEXT' },
        approval_history: { accessible: false, visibility: 'RESTRICTED', reason: 'OUTSIDE_CONTEXT' }
      }
    }
  });

  const vmOutside = adaptAidRequestToViewModel(outsideReq);
  assert.strictEqual(vmOutside.proposal.biaya.type, 'PRIVACY_MASKED');
  assert.strictEqual((vmOutside.proposal.biaya as any).reason, 'OUTSIDE_CONTEXT');
  console.log("   ✅ Passed: Outside context correctly masked across restricted nodes.");

  // Test 4: EMPTY vs PRIVACY_MASKED Invariant Assertion
  console.log("Test 4: EMPTY vs PRIVACY_MASKED Invariant Assertion");
  const emptyReq = createMockAidRequestData({
    proposal: {
      biaya: null,
      keterangan: null,
      id_tanah: null,
      id_bangunan: null,
      id_aset_b: null
    },
    approval_history: [],
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        workflow: { accessible: true, visibility: 'ORG_WIDE' },
        proposal: { accessible: true, visibility: 'RESTRICTED' }, // ACCESSIBLE + NULL
        approval_history: { accessible: false, visibility: 'RESTRICTED', reason: 'INSUFFICIENT_PERMISSION' } // INACCESSIBLE
      }
    }
  });

  const vmEmpty = adaptAidRequestToViewModel(emptyReq);
  assert.strictEqual(vmEmpty.proposal.biaya.type, 'EMPTY', "Accessible + null biaya MUST resolve to EMPTY");
  assert.strictEqual(vmEmpty.approvalHistory.items.type, 'PRIVACY_MASKED', "Inaccessible approval history MUST resolve to PRIVACY_MASKED");
  console.log("   ✅ Passed: Invariant verified (accessible+empty = EMPTY, inaccessible = PRIVACY_MASKED).");

  console.log("\n🎉 ALL AID REQUEST ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runAidRequestAdapterUnitTests();
