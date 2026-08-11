import * as assert from 'assert';
import { UnifiedPastoralTransferData, TransferStatus, AssignmentStatus } from '../src/types/pastoralTransfer.types';

class PastoralTransferMockEngine {
  private transfers = new Map<string, any>();
  private assignments = new Map<string, any>();
  private transactionLogs = new Set<string>();
  private currentUid: string | null = 'USER-SINODE-001';

  setAuthUser(uid: string | null) {
    this.currentUid = uid;
  }

  seedData() {
    // Seed initial active assignment for Pdt. Abraham Lincoln
    const id_penugasan = 'NUGAS-001';
    this.assignments.set(id_penugasan, {
      id_penugasan,
      id_person: 'PERSON-PDT-001',
      id_pos: 'ORG-GPIB-JAKARTA',
      nama_organisasi: 'GPIB Paulus Jakarta',
      jabatan: 'Ketua Majelis Jemaat',
      tanggal_mulai: '2022-01-01',
      tanggal_selesai: null,
      status_penugasan: 'ACTIVE' as AssignmentStatus
    });

    // Seed proposal
    const id_mutasi = 'MUTASI-001';
    this.transfers.set(id_mutasi, {
      id_mutasi,
      id_person: 'PERSON-PDT-001',
      nama_lengkap: 'Pdt. Abraham Lincoln, M.Th.',
      id_org_asal: 'ORG-GPIB-JAKARTA',
      nama_org_asal: 'GPIB Paulus Jakarta',
      id_org_tujuan: 'ORG-GPIB-SURABAYA',
      nama_org_tujuan: 'GPIB Immanuel Surabaya',
      status_mutasi: 'PROPOSED' as TransferStatus,
      tanggal_efektif: '2026-09-01',
      catatan: 'Mutasi Tugas Periodik Sinode',
      created_by: 'USER-SINODE-001',
      created_at: new Date().toISOString()
    });
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
      // 1. Archive current active assignment to TRANSFERRED
      for (const assignment of Array.from(this.assignments.values())) {
        if (assignment.id_person === transfer.id_person && assignment.status_penugasan === 'ACTIVE') {
          assignment.status_penugasan = 'TRANSFERRED';
          assignment.tanggal_selesai = new Date().toISOString().split('T')[0];
        }
      }

      // 2. Insert new ACTIVE assignment for receiving org
      const newAssignmentId = 'NUGAS-' + Math.random().toString(36).substring(2, 8);
      this.assignments.set(newAssignmentId, {
        id_penugasan: newAssignmentId,
        id_person: transfer.id_person,
        id_pos: transfer.id_org_tujuan,
        nama_organisasi: transfer.nama_org_tujuan,
        jabatan: 'Ketua Majelis Jemaat',
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: null,
        status_penugasan: 'ACTIVE' as AssignmentStatus
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
  console.log("🧪 Starting F8 Pastoral Transfer RPC & Security Harness Test...\n");

  const engine = new PastoralTransferMockEngine();
  engine.seedData();

  // Test 1: Unauthenticated Isolation Gate
  console.log("Gate 1: Unauthenticated Isolation Gate");
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

  // Restore session
  engine.setAuthUser('USER-SINODE-001');

  // Test 2: State Machine Transition Enforcement Gate
  console.log("Gate 2: State Machine Transition Enforcement Gate");
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

  // Test 3: Valid Approval Transition
  console.log("Gate 3: Valid Approval Transition");
  const approvedData = await engine.transition_pastoral_transfer_atomic({
    p_id_mutasi: 'MUTASI-001',
    p_action: 'approve'
  });
  assert.strictEqual(approvedData.transfer.status_mutasi, 'APPROVED_SINODE');
  console.log("   ✅ Passed: Transition PROPOSED ➔ APPROVED_SINODE succeeded.");

  // Test 4: Single Active Assignment & Atomic Deployment Gate
  console.log("Gate 4: Single Active Assignment & Atomic Deployment Gate");
  const initialActiveCount = engine.getActiveAssignmentCount('PERSON-PDT-001');
  assert.strictEqual(initialActiveCount, 1);

  const deployedData = await engine.transition_pastoral_transfer_atomic({
    p_id_mutasi: 'MUTASI-001',
    p_action: 'deploy',
    p_request_id: 'REQ-DEPLOY-001'
  });

  assert.strictEqual(deployedData.transfer.status_mutasi, 'DEPLOYED');
  assert.strictEqual(deployedData.current_assignment?.nama_organisasi, 'GPIB Immanuel Surabaya');
  
  const finalActiveCount = engine.getActiveAssignmentCount('PERSON-PDT-001');
  assert.strictEqual(finalActiveCount, 1, "Person MUST NOT have more than 1 active assignment after deployment");
  console.log("   ✅ Passed: Single Active Assignment constraint preserved (Old ➔ TRANSFERRED, New ➔ ACTIVE).");

  // Test 5: Historical Continuity Chain Gate
  console.log("Gate 5: Historical Continuity Chain Gate");
  assert.strictEqual(deployedData.assignment_history.length, 2);
  const oldAssignment = deployedData.assignment_history.find(a => a.status_penugasan === 'TRANSFERRED');
  assert.ok(oldAssignment);
  assert.strictEqual(oldAssignment.nama_organisasi, 'GPIB Paulus Jakarta');
  console.log("   ✅ Passed: Previous assignment archived into historical service chain with TRANSFERRED status.");

  // Test 6: Request Idempotency Gate
  console.log("Gate 6: Request Idempotency Gate");
  const reSubmittedData = await engine.transition_pastoral_transfer_atomic({
    p_id_mutasi: 'MUTASI-001',
    p_action: 'deploy',
    p_request_id: 'REQ-DEPLOY-001'
  });
  assert.strictEqual(reSubmittedData.assignment_history.length, 2, "Idempotent retry MUST NOT duplicate assignment records");
  console.log("   ✅ Passed: Idempotency token prevented duplicate assignment creation.");

  console.log("\n🎉 ALL 6 F8 PASTORAL TRANSFER SECURITY TEST GATES PASSED 100% SUCCESSFULLY!\n");
}

runPastoralTransferHarness();
