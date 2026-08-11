import * as assert from 'assert';
import { UnifiedPastoralTransferData } from '../src/types/pastoralTransfer.types';
import { adaptPastoralTransferToViewModel, calculateDurationFormatted } from '../src/adapters/pastoralTransferViewModelAdapter';

function runPastoralTransferAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptPastoralTransferToViewModel...\n");

  // Test 2: Assignment Duration Formatter Check
  console.log("Test 2: Assignment Duration Formatter Check");
  assert.strictEqual(calculateDurationFormatted('2020-01-01', '2022-07-01'), '2 Tahun 6 Bulan');
  assert.strictEqual(calculateDurationFormatted('2024-01-01', '2024-05-01'), '4 Bulan');
  console.log("   ✅ Passed: calculateDurationFormatted correctly formats service duration.");

  const mockTransferData: UnifiedPastoralTransferData = {
    id_mutasi: 'MUTASI-001',
    transfer: {
      id_mutasi: 'MUTASI-001',
      id_person: 'PERSON-PDT-001',
      nama_lengkap: 'Pdt. Abraham Lincoln, M.Th.',
      id_org_asal: 'ORG-GPIB-JAKARTA',
      nama_org_asal: 'GPIB Paulus Jakarta',
      id_org_tujuan: 'ORG-GPIB-SURABAYA',
      nama_org_tujuan: 'GPIB Immanuel Surabaya',
      status_mutasi: 'APPROVED_SINODE',
      tanggal_efektif: '2026-09-01',
      catatan: 'Disetujui Sidang Majelis Sinode',
      created_at: '2026-08-01T10:00:00Z'
    },
    current_assignment: {
      id_penugasan: 'NUGAS-001',
      id_person: 'PERSON-PDT-001',
      id_pos: 'ORG-GPIB-JAKARTA',
      nama_organisasi: 'GPIB Paulus Jakarta',
      jabatan: 'Ketua Majelis Jemaat',
      tanggal_mulai: '2020-01-01',
      tanggal_selesai: null,
      status_penugasan: 'ACTIVE'
    },
    assignment_history: [
      {
        id_penugasan: 'NUGAS-001',
        id_person: 'PERSON-PDT-001',
        id_pos: 'ORG-GPIB-JAKARTA',
        nama_organisasi: 'GPIB Paulus Jakarta',
        jabatan: 'Ketua Majelis Jemaat',
        tanggal_mulai: '2020-01-01',
        tanggal_selesai: null,
        status_penugasan: 'ACTIVE'
      },
      {
        id_penugasan: 'NUGAS-000',
        id_person: 'PERSON-PDT-001',
        id_pos: 'ORG-GPIB-MEDAN',
        nama_organisasi: 'GPIB Immanuel Medan',
        jabatan: 'Pendeta Jemaat',
        tanggal_mulai: '2016-01-01',
        tanggal_selesai: '2019-12-31',
        status_penugasan: 'TRANSFERRED'
      }
    ]
  };

  // Test 1: Transfer Lifecycle & Status Badge Mapping
  console.log("Test 1: Transfer Lifecycle & Status Badge Mapping");
  const vm = adaptPastoralTransferToViewModel(mockTransferData);

  assert.strictEqual(vm.transfer.id_mutasi, 'MUTASI-001');
  assert.strictEqual(vm.transfer.status_mutasi, 'APPROVED_SINODE');
  assert.strictEqual(vm.transfer.statusLabel, 'Disetujui Sinode (Menunggu Penempatan SK)');
  console.log("   ✅ Passed: Transfer metadata and lifecycle status mapped correctly.");

  // Test 3: Historical Service Ordering & Summary Metrics
  console.log("Test 3: Historical Service Ordering & Summary Metrics");
  assert.strictEqual(vm.summaryMetrics.totalAssignments, 2);
  assert.strictEqual(vm.summaryMetrics.completedAssignmentsCount, 1);
  assert.strictEqual(vm.summaryMetrics.activeAssignmentOrg, 'GPIB Paulus Jakarta');
  assert.strictEqual(vm.currentAssignment?.durationFormatted.includes('Tahun'), true);
  console.log("   ✅ Passed: Historical assignment chain and summary metrics computed correctly.");

  // Test 4: Pure Adapter Invariants (0 Auth / 0 UI Action Flags)
  console.log("Test 4: Pure Adapter Invariants (0 Auth / 0 UI Action Flags)");
  const jsonStr = JSON.stringify(vm);
  assert.strictEqual(jsonStr.includes('canApprove'), false, "canApprove MUST NOT be present");
  assert.strictEqual(jsonStr.includes('canDeploy'), false, "canDeploy MUST NOT be present");
  assert.strictEqual(jsonStr.includes('canReject'), false, "canReject MUST NOT be present");
  assert.strictEqual(jsonStr.includes('role'), false, "role MUST NOT be present");
  console.log("   ✅ Passed: Zero UI action flags or auth logic in ViewModel payload.");

  console.log("\n🎉 ALL PASTORAL TRANSFER ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runPastoralTransferAdapterUnitTests();
