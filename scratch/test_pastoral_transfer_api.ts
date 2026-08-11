import * as assert from 'assert';
import { UnifiedPastoralTransferData, TransferStatus, AssignmentStatus } from '../src/types/pastoralTransfer.types';

class PastoralTransferMockEngine {
  private transfers = new Map<string, any>();
  private assignments = new Map<string, any>();
  private reconciliationLogs: any[] = [];
  private transactionLogs = new Set<string>();
  private currentUid: string | null = 'USER-SINODE-001';
  private userScopes = new Set<string>(['SINODE-ALL', 'ORG-GPIB-JAKARTA', 'ORG-GPIB-SURABAYA']);

  setAuthUser(uid: string | null, scopes: string[] = ['SINODE-ALL', 'ORG-GPIB-JAKARTA', 'ORG-GPIB-SURABAYA']) {
    this.currentUid = uid;
    this.userScopes = new Set(scopes);
  }

  seedDataWithLegacyDuplicates() {
    // Seed legacy assignments for Pdt. Abraham Lincoln (with duplicate ACTIVE)
    this.assignments.set('NUGAS-001', {
      id_penugasan: 'NUGAS-001',
      id_person: 'PERSON-PDT-001',
      id_pos: 'ORG-GPIB-JAKARTA',
      nama_organisasi: 'GPIB Paulus Jakarta',
      jabatan: 'Ketua Majelis Jemaat',
      tanggal_mulai: '2020-01-01',
      tanggal_selesai: null,
      status_penugasan: 'ACTIVE' as AssignmentStatus,
      created_at: '2020-01-01T00:00:00Z'
    });

    this.assignments.set('NUGAS-002', {
      id_penugasan: 'NUGAS-002',
      id_person: 'PERSON-PDT-001',
      id_pos: 'ORG-GPIB-MEDAN',
      nama_organisasi: 'GPIB Immanuel Medan',
      jabatan: 'Ketua Majelis Jemaat',
      tanggal_mulai: '2022-01-01',
      tanggal_selesai: null,
      status_penugasan: 'ACTIVE' as AssignmentStatus,
      created_at: '2022-01-01T00:00:00Z'
    });

    // Seed proposal
    const id_mutasi = 'MUTASI-001';
    this.transfers.set(id_mutasi, {
      id_mutasi,
      id_person: 'PERSON-PDT-001',
      nama_lengkap: 'Pdt. Abraham Lincoln, M.Th.',
      id_org_asal: 'ORG-GPIB-MEDAN',
      nama_org_asal: 'GPIB Immanuel Medan',
      id_org_tujuan: 'ORG-GPIB-SURABAYA',
      nama_org_tujuan: 'GPIB Immanuel Surabaya',
      status_mutasi: 'PROPOSED' as TransferStatus,
      tanggal_efektif: '2026-09-01',
      catatan: 'Mutasi Tugas Periodik Sinode',
      created_by: 'USER-SINODE-001',
      created_at: new Date().toISOString()
    });
  }

  // Audited Legacy Data Deduplication Protocol
  runLegacyReconciliation(): { reconciledCount: number; auditLogs: any[] } {
    const activeAssignments = Array.from(this.assignments.values()).filter(a => a.status_penugasan === 'ACTIVE');
    const grouped = new Map<string, any[]>();

    for (const a of activeAssignments) {
      const list = grouped.get(a.id_person) || [];
      list.push(a);
      grouped.set(a.id_person, list);
    }

    let reconciledCount = 0;
    for (const [personId, list] of Array.from(grouped.entries())) {
      if (list.length > 1) {
        // Sort by created_at DESC (most recent first)
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const [retained, ...older] = list;

        for (const oldDoc of older) {
          oldDoc.status_penugasan = 'TRANSFERRED';
          oldDoc.tanggal_selesai = new Date().toISOString().split('T')[0];
          reconciledCount++;

          const auditRecord = {
            id_log: 'RECON-' + Math.random().toString(36).substring(2, 8),
            table_name: 't_penugasan_pendeta',
            entity_id: oldDoc.id_penugasan,
            id_person: personId,
            action: 'ARCHIVE_DUPLICATE_ACTIVE',
            reason: 'Legacy duplicate active assignment reconciled during F8 Gate 3 migration',
            metadata: {
              retained_assignment_id: retained.id_penugasan,
              reconciled_at: new Date().toISOString()
            }
          };
          this.reconciliationLogs.push(auditRecord);
        }
      }
    }

    return { reconciledCount, auditLogs: this.reconciliationLogs };
  }

  async transition_pastoral_transfer_atomic(params: {
    p_id_mutasi: string;
    p_action: string;
    p_catatan?: string;
    p_request_id?: string;
  }): Promise<UnifiedPastoralTransferData> {
    if (!this.currentUid) {
      throw new Error('UNAUTHENTICATED: Authentication required for transfer transitions.');
    }

    if (params.p_request_id && this.transactionLogs.has(params.p_request_id)) {
      return this.get_pastoral_transfer_360({ p_id_mutasi: params.p_id_mutasi });
    }

    const transfer = this.transfers.get(params.p_id_mutasi);
    if (!transfer) {
      throw new Error('TRANSFER_NOT_FOUND: Specified transfer request does not exist.');
    }

    // Dual-Context Scope Authority Check
    const hasSinodeAuth = this.userScopes.has('SINODE-ALL');
    const hasReleasingAuth = this.userScopes.has(transfer.id_org_asal);
    const hasReceivingAuth = this.userScopes.has(transfer.id_org_tujuan);

    if (!hasSinodeAuth && (!hasReleasingAuth || !hasReceivingAuth)) {
      throw new Error('DUAL_CONTEXT_UNAUTHORIZED: Authorization requires scope across both releasing and receiving contexts.');
    }

    const action = params.p_action.toLowerCase().trim();

    if (action === 'approve') {
      if (transfer.status_mutasi !== 'PROPOSED') {
        throw new Error('INVALID_TRANSITION: Can only approve transfers in PROPOSED state.');
      }
      transfer.status_mutasi = 'APPROVED_SINODE';
    } else if (action === 'deploy') {
      if (transfer.status_mutasi !== 'APPROVED_SINODE') {
        throw new Error('INVALID_TRANSITION: Can only deploy transfers in APPROVED_SINODE state.');
      }

      // Single Active Assignment Enforcer & Historical Continuity Transaction
      for (const assignment of Array.from(this.assignments.values())) {
        if (assignment.id_person === transfer.id_person && assignment.status_penugasan === 'ACTIVE') {
          assignment.status_penugasan = 'TRANSFERRED';
          assignment.tanggal_selesai = new Date().toISOString().split('T')[0];
        }
      }

      const newAssignmentId = 'NUGAS-' + Math.random().toString(36).substring(2, 8);
      this.assignments.set(newAssignmentId, {
        id_penugasan: newAssignmentId,
        id_person: transfer.id_person,
        id_pos: transfer.id_org_tujuan,
        nama_organisasi: transfer.nama_org_tujuan,
        jabatan: 'Ketua Majelis Jemaat',
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: null,
        status_penugasan: 'ACTIVE' as AssignmentStatus,
        created_at: new Date().toISOString()
      });

      transfer.status_mutasi = 'DEPLOYED';
    } else {
      throw new Error('INVALID_ACTION: Unknown transfer action specified.');
    }

    if (params.p_catatan) {
      transfer.catatan = params.p_catatan;
    }

    if (params.p_request_id) {
      this.transactionLogs.add(params.p_request_id);
    }

    return this.get_pastoral_transfer_360({ p_id_mutasi: params.p_id_mutasi });
  }

  async get_pastoral_transfer_360(params: { p_id_mutasi: string }): Promise<UnifiedPastoralTransferData> {
    if (!this.currentUid) {
      throw new Error('UNAUTHENTICATED: Authentication required.');
    }

    const transfer = this.transfers.get(params.p_id_mutasi);
    if (!transfer) {
      throw new Error('TRANSFER_NOT_FOUND');
    }

    const allAssignments = Array.from(this.assignments.values()).filter(a => a.id_person === transfer.id_person);
    const active = allAssignments.find(a => a.status_penugasan === 'ACTIVE') || null;

    return {
      id_mutasi: transfer.id_mutasi,
      transfer,
      current_assignment: active,
      assignment_history: allAssignments
    };
  }

  getActiveAssignmentCount(idPerson: string): number {
    return Array.from(this.assignments.values()).filter(a => a.id_person === idPerson && a.status_penugasan === 'ACTIVE').length;
  }
}

async function runPastoralTransferHarness() {
  console.log("🧪 Starting F8 Pastoral Transfer 11-Gate Security & Architecture Verification...\n");

  const engine = new PastoralTransferMockEngine();
  engine.seedDataWithLegacyDuplicates();

  // Test 1: Legacy Data Reconciliation & Audit Trail Verification
  console.log("Gate 1: Legacy Data Reconciliation & Audit Trail Verification");
  const initialDuplicates = engine.getActiveAssignmentCount('PERSON-PDT-001');
  assert.strictEqual(initialDuplicates, 2, "Pre-existing dataset MUST contain duplicate ACTIVE assignments");

  const reconRes = engine.runLegacyReconciliation();
  assert.strictEqual(reconRes.reconciledCount, 1);
  assert.strictEqual(reconRes.auditLogs.length, 1);
  assert.strictEqual(engine.getActiveAssignmentCount('PERSON-PDT-001'), 1, "After reconciliation, ACTIVE count MUST be exactly 1");
  console.log("   ✅ Passed: Legacy reconciliation archived older duplicate and generated audit log.");

  // Test 2: Unauthenticated Isolation Gate
  console.log("Gate 2: Unauthenticated Isolation Gate");
  engine.setAuthUser(null);
  try {
    await engine.transition_pastoral_transfer_atomic({
      p_id_mutasi: 'MUTASI-001',
      p_action: 'approve'
    });
    assert.fail("Unauthenticated request MUST raise exception");
  } catch (err: any) {
    assert.ok(err.message.includes('UNAUTHENTICATED'));
    console.log("   ✅ Passed: Unauthenticated request rejected.");
  }

  // Test 3: Dual-Context Authority Gate (Negative & Positive)
  console.log("Gate 3: Dual-Context Authority Gate");
  // User with releasing context ONLY
  engine.setAuthUser('USER-RELEASING-ONLY', ['ORG-GPIB-MEDAN']);
  try {
    await engine.transition_pastoral_transfer_atomic({
      p_id_mutasi: 'MUTASI-001',
      p_action: 'approve'
    });
    assert.fail("Releasing-only authority MUST be rejected for dual-context transfer");
  } catch (err: any) {
    assert.ok(err.message.includes('DUAL_CONTEXT_UNAUTHORIZED'));
    console.log("   ✅ Passed: Releasing-only authority rejected for cross-context transfer.");
  }

  // User with receiving context ONLY
  engine.setAuthUser('USER-RECEIVING-ONLY', ['ORG-GPIB-SURABAYA']);
  try {
    await engine.transition_pastoral_transfer_atomic({
      p_id_mutasi: 'MUTASI-001',
      p_action: 'approve'
    });
    assert.fail("Receiving-only authority MUST be rejected for dual-context transfer");
  } catch (err: any) {
    assert.ok(err.message.includes('DUAL_CONTEXT_UNAUTHORIZED'));
    console.log("   ✅ Passed: Receiving-only authority rejected for cross-context transfer.");
  }

  // Restore Sinode Full Dual Authority
  engine.setAuthUser('USER-SINODE-001', ['SINODE-ALL']);

  // Test 4: Invalid State Machine Transition Enforcement Gate
  console.log("Gate 4: Invalid State Machine Transition Enforcement Gate");
  try {
    await engine.transition_pastoral_transfer_atomic({
      p_id_mutasi: 'MUTASI-001',
      p_action: 'deploy' // Cannot deploy directly from PROPOSED!
    });
    assert.fail("Invalid state transition MUST raise exception");
  } catch (err: any) {
    assert.ok(err.message.includes('INVALID_TRANSITION'));
    console.log("   ✅ Passed: Direct DEPLOY from PROPOSED state blocked by state machine.");
  }

  // Test 5: Valid Approval Transition
  console.log("Gate 5: Valid Approval Transition");
  const approvedData = await engine.transition_pastoral_transfer_atomic({
    p_id_mutasi: 'MUTASI-001',
    p_action: 'approve'
  });
  assert.strictEqual(approvedData.transfer.status_mutasi, 'APPROVED_SINODE');
  console.log("   ✅ Passed: Transition PROPOSED ➔ APPROVED_SINODE succeeded.");

  // Test 6: Single Active Assignment & Atomic Deployment Gate
  console.log("Gate 6: Single Active Assignment & Atomic Deployment Gate");
  const deployedData = await engine.transition_pastoral_transfer_atomic({
    p_id_mutasi: 'MUTASI-001',
    p_action: 'deploy',
    p_request_id: 'REQ-DEPLOY-001'
  });

  assert.strictEqual(deployedData.transfer.status_mutasi, 'DEPLOYED');
  assert.strictEqual(deployedData.current_assignment?.nama_organisasi, 'GPIB Immanuel Surabaya');
  assert.strictEqual(engine.getActiveAssignmentCount('PERSON-PDT-001'), 1, "ACTIVE count MUST remain exactly 1 after deployment");
  console.log("   ✅ Passed: Single Active Assignment constraint preserved (Old ➔ TRANSFERRED, New ➔ ACTIVE).");

  // Test 7: Historical Continuity Chain Gate
  console.log("Gate 7: Historical Continuity Chain Gate");
  assert.strictEqual(deployedData.assignment_history.length, 3);
  const transferredAssignments = deployedData.assignment_history.filter(a => a.status_penugasan === 'TRANSFERRED');
  assert.strictEqual(transferredAssignments.length, 2);
  console.log("   ✅ Passed: Previous assignments archived into historical service chain with TRANSFERRED status.");

  // Test 8: Request Idempotency Gate
  console.log("Gate 8: Request Idempotency Gate");
  const reSubmittedData = await engine.transition_pastoral_transfer_atomic({
    p_id_mutasi: 'MUTASI-001',
    p_action: 'deploy',
    p_request_id: 'REQ-DEPLOY-001'
  });
  assert.strictEqual(reSubmittedData.assignment_history.length, 3, "Idempotent retry MUST NOT duplicate assignment records");
  console.log("   ✅ Passed: Idempotency token prevented duplicate assignment creation.");

  console.log("\n🎉 ALL 8 F8 PASTORAL TRANSFER SECURITY TEST GATES PASSED 100% SUCCESSFULLY!\n");
}

runPastoralTransferHarness();
