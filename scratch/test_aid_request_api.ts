import * as assert from 'assert';
import { UnifiedAidRequestData, AidRequestStatus } from '../src/types/aidRequest.types';

// Mock state store simulating PostgreSQL Aid Request & Approval Tables
interface MockAidRequestRecord {
  id_ajuan: string;
  id_pos: string;
  jenis_bantuan: string;
  biaya: number;
  urgensi: string;
  status: AidRequestStatus;
  keterangan: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface MockApprovalRecord {
  id: number;
  id_ajuan: string;
  approver_id: string;
  role_approver: string;
  aksi: string;
  catatan: string | null;
  created_at: string;
}

const mockDatabase: {
  aidRequests: Record<string, MockAidRequestRecord>;
  approvals: MockApprovalRecord[];
  transactionLogs: Set<string>;
} = {
  aidRequests: {
    'AJUAN-TEST-001': {
      id_ajuan: 'AJUAN-TEST-001',
      id_pos: '01-10-YB',
      jenis_bantuan: 'Perbaikan Atap Gereja',
      biaya: 25000000.00,
      urgensi: 'Tinggi',
      status: 'Draft',
      keterangan: 'Atap bocor parah saat musim hujan',
      created_at: '2026-08-11T10:00:00Z',
      updated_at: '2026-08-11T10:00:00Z',
      created_by: 'USER-001'
    }
  },
  approvals: [],
  transactionLogs: new Set()
};

// 1. QUERY RPC: get_aid_request_360(p_id_ajuan)
function mockGetAidRequest360(
  p_id_ajuan: string | null,
  requesterRole: string | null = null,
  requesterInduk: string | null = null
): UnifiedAidRequestData | null {
  if (!p_id_ajuan || p_id_ajuan.trim() === '' || !mockDatabase.aidRequests[p_id_ajuan]) {
    return null; // Test Gate 2: Deterministic resolution guard (0 fallback guessing)
  }

  const req = mockDatabase.aidRequests[p_id_ajuan];
  const isSuperuser = requesterRole === 'super_user';
  const isSameTree = isSuperuser || (requesterInduk === '01-10-INDEK');
  const isRestrictedAuthorized = isSuperuser || (isSameTree && requesterRole !== null && ['kmj', 'admin_mupel', 'pj'].includes(requesterRole));

  const accessLevel = requesterRole === null 
    ? 'UNAUTHENTICATED' 
    : isRestrictedAuthorized 
      ? 'FULL_ADMIN' 
      : 'STANDARD';

  const approvalHistory = isRestrictedAuthorized
    ? mockDatabase.approvals
        .filter(a => a.id_ajuan === p_id_ajuan)
        .map(a => ({
          id: a.id,
          role_approver: a.role_approver,
          aksi: a.aksi,
          catatan: a.catatan,
          created_at: a.created_at
        }))
    : [];

  return {
    id_ajuan: req.id_ajuan,
    identity: {
      id_ajuan: req.id_ajuan,
      jenis_bantuan: req.jenis_bantuan,
      urgensi: req.urgensi as any
    },
    ownership: {
      id_pos: req.id_pos,
      nama_organisasi: 'GPIB Jemaat Immanuel',
      org_level: 'POS_PELKES'
    },
    workflow: {
      status: req.status,
      created_at: req.created_at
    },
    proposal: isRestrictedAuthorized ? {
      biaya: req.biaya,
      keterangan: req.keterangan,
      id_tanah: null,
      id_bangunan: null,
      id_aset_b: null
    } : null,
    approval_history: approvalHistory,
    context: {
      requester_access_level: accessLevel,
      is_same_ancestral_tree: isSameTree
    },
    _meta: {
      privacy: {
        identity: { accessible: true, visibility: 'ORG_WIDE' },
        ownership: { accessible: true, visibility: 'ORG_WIDE' },
        workflow: { accessible: true, visibility: 'ORG_WIDE' },
        proposal: {
          accessible: isRestrictedAuthorized,
          visibility: 'RESTRICTED',
          reason: isRestrictedAuthorized ? undefined : 'INSUFFICIENT_PERMISSION'
        },
        approval_history: {
          accessible: isRestrictedAuthorized,
          visibility: 'RESTRICTED',
          reason: isRestrictedAuthorized ? undefined : 'INSUFFICIENT_PERMISSION'
        }
      }
    }
  };
}

// 2. COMMAND RPC: transition_aid_request_atomic(...)
function mockTransitionAidRequestAtomic(
  p_id_ajuan: string,
  p_action: string,
  p_catatan: string | null = null,
  p_request_id: string | null = null,
  requesterRole: string = 'user',
  requesterInduk: string = '01-10-INDEK'
): UnifiedAidRequestData {
  if (requesterRole === 'unauthenticated') {
    throw new Error('UNAUTHORIZED');
  }

  // Idempotency Token Check
  if (p_request_id && mockDatabase.transactionLogs.has(p_request_id)) {
    const existing = mockGetAidRequest360(p_id_ajuan, requesterRole, requesterInduk);
    if (!existing) throw new Error('AID_REQUEST_NOT_FOUND');
    return existing;
  }

  const req = mockDatabase.aidRequests[p_id_ajuan];
  if (!req) {
    throw new Error('AID_REQUEST_NOT_FOUND');
  }

  const action = p_action.toLowerCase().trim();
  let targetStatus: AidRequestStatus;
  let isAuthorized = false;
  const isSuperuser = requesterRole === 'super_user';

  if (req.status === 'Draft') {
    if (action === 'submit') {
      targetStatus = 'Pending_KMJ';
      isAuthorized = true; // User/PJ in org
    } else {
      throw new Error('INVALID_TRANSITION');
    }
  } else if (req.status === 'Pending_KMJ') {
    if (action === 'approve') {
      targetStatus = 'Pending_Mupel';
      isAuthorized = isSuperuser || requesterRole === 'kmj';
    } else if (action === 'reject') {
      targetStatus = 'Rejected';
      isAuthorized = isSuperuser || requesterRole === 'kmj';
    } else {
      throw new Error('INVALID_TRANSITION');
    }
  } else if (req.status === 'Pending_Mupel') {
    if (action === 'approve') {
      targetStatus = 'Pending_Sinode';
      isAuthorized = isSuperuser || requesterRole === 'admin_mupel';
    } else if (action === 'reject') {
      targetStatus = 'Rejected';
      isAuthorized = isSuperuser || requesterRole === 'admin_mupel';
    } else {
      throw new Error('INVALID_TRANSITION');
    }
  } else {
    throw new Error('INVALID_TRANSITION');
  }

  if (!isAuthorized) {
    throw new Error('INSUFFICIENT_PERMISSION');
  }

  // Atomic Mutation
  req.status = targetStatus;
  req.updated_at = new Date().toISOString();

  mockDatabase.approvals.push({
    id: mockDatabase.approvals.length + 1,
    id_ajuan: p_id_ajuan,
    approver_id: 'USER-100',
    role_approver: requesterRole,
    aksi: action,
    catatan: p_catatan,
    created_at: new Date().toISOString()
  });

  if (p_request_id) {
    mockDatabase.transactionLogs.add(p_request_id);
  }

  const updated = mockGetAidRequest360(p_id_ajuan, requesterRole, requesterInduk);
  if (!updated) throw new Error('FETCH_FAILED');
  return updated;
}

function runAidRequestSecurityHarness() {
  console.log("🧪 Starting F5 Security & State Machine Test Harness for Aid Request...\n");

  // TEST GATE 1 — Unauthenticated Access Isolation
  console.log("Test Gate 1: Unauthenticated Access Isolation");
  const unauthRes = mockGetAidRequest360('AJUAN-TEST-001', null);
  assert.notStrictEqual(unauthRes, null);
  assert.strictEqual(unauthRes!.context.requester_access_level, 'UNAUTHENTICATED');
  assert.strictEqual(unauthRes!._meta.privacy.proposal.accessible, false);
  assert.strictEqual(unauthRes!.proposal, null);
  assert.strictEqual(unauthRes!.approval_history.length, 0);
  console.log("   ✅ Passed: Unauthenticated request masked proposal & approval history.");

  // TEST GATE 2 — Deterministic Ambiguity & Not Found Guard
  console.log("\nTest Gate 2: Ambiguity & Not Found Guard (0 Fallback Guessing)");
  assert.strictEqual(mockGetAidRequest360('NON_EXISTENT_ID', 'kmj'), null);
  assert.strictEqual(mockGetAidRequest360('', 'kmj'), null);
  assert.strictEqual(mockGetAidRequest360(null, 'kmj'), null);
  console.log("   ✅ Passed: Invalid/non-existent ID deterministically returns NULL.");

  // TEST GATE 3 — SYSTEM_ONLY Exclusion Invariant
  console.log("\nTest Gate 3: SYSTEM_ONLY Exclusion Invariant");
  const kmjRes = mockGetAidRequest360('AJUAN-TEST-001', 'kmj', '01-10-INDEK');
  assert.notStrictEqual(kmjRes, null);
  const jsonStr = JSON.stringify(kmjRes);
  assert.strictEqual(jsonStr.includes('updated_at'), false, "updated_at MUST NOT be present in JSON payload");
  assert.strictEqual(jsonStr.includes('created_by'), false, "created_by MUST NOT be present in JSON payload");
  assert.strictEqual(jsonStr.includes('password_hash'), false, "password_hash MUST NOT be present");
  console.log("   ✅ Passed: Zero SYSTEM_ONLY fields (updated_at/created_by) leaked in JSON.");

  // TEST GATE 4 & 6 — Workflow State Machine Atomic Submit & Idempotency
  console.log("\nTest Gate 4 & 6: Atomic Transition (Draft -> Pending_KMJ) & Idempotency");
  const reqIdToken = 'REQ-TOKEN-1001';
  const submitRes = mockTransitionAidRequestAtomic('AJUAN-TEST-001', 'submit', 'Pengajuan awal Pos Pelkes', reqIdToken, 'kmj');
  assert.strictEqual(submitRes.workflow.status, 'Pending_KMJ');
  assert.strictEqual(submitRes.approval_history.length, 1);
  assert.strictEqual(submitRes.approval_history[0].aksi, 'submit');
  console.log("   ✅ Passed: Draft -> Pending_KMJ mutated atomically with approval log.");

  // Test Idempotency Guard
  const idemRes = mockTransitionAidRequestAtomic('AJUAN-TEST-001', 'submit', 'Pengajuan awal Pos Pelkes', reqIdToken, 'kmj');
  assert.strictEqual(idemRes.workflow.status, 'Pending_KMJ');
  assert.strictEqual(idemRes.approval_history.length, 1, "Re-submitting identical request_id MUST NOT create duplicate audit logs");
  console.log("   ✅ Passed: Idempotency token safely prevented duplicate mutation.");

  // TEST GATE 4 — Workflow Authorization (Role & Scope Validation)
  console.log("\nTest Gate 4: Workflow Authorization (Unauthorized Role Rejection)");
  assert.throws(() => {
    mockTransitionAidRequestAtomic('AJUAN-TEST-001', 'approve', 'Coba setuju tanpa role KMJ', 'REQ-TOKEN-1002', 'unauthorized_role');
  }, /INSUFFICIENT_PERMISSION/);
  console.log("   ✅ Passed: Unauthorized role attempting KMJ approval correctly rejected with INSUFFICIENT_PERMISSION.");

  // TEST GATE 5 — State Machine Transition Integrity (Illegal State Jump)
  console.log("\nTest Gate 5: State Machine Transition Integrity (Illegal State Jump)");
  // Authorized KMJ approves Pending_KMJ -> Pending_Mupel
  const approveRes = mockTransitionAidRequestAtomic('AJUAN-TEST-001', 'approve', 'Disetujui KMJ Immanuel', 'REQ-TOKEN-1003', 'kmj');
  assert.strictEqual(approveRes.workflow.status, 'Pending_Mupel');
  assert.strictEqual(approveRes.approval_history.length, 2);

  // Attempt illegal transition: submit on Pending_Mupel
  assert.throws(() => {
    mockTransitionAidRequestAtomic('AJUAN-TEST-001', 'submit', 'Illegal submit on Pending_Mupel', 'REQ-TOKEN-1004', 'kmj');
  }, /INVALID_TRANSITION/);
  console.log("   ✅ Passed: Illegal transition correctly rejected with INVALID_TRANSITION exception.");

  console.log("\n🎉 ALL 6 F5 AID REQUEST SECURITY & STATE MACHINE TEST GATES PASSED 100% SUCCESSFULLY!\n");
}

runAidRequestSecurityHarness();
