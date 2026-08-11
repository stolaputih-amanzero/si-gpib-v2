import * as assert from 'assert';
import { UnifiedBatchData } from '../src/types/batchProcessing.types';
import { adaptBatchProcessingToViewModel } from '../src/adapters/batchProcessingViewModelAdapter';

function runBatchAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptBatchProcessingToViewModel...\n");

  const mockBatchData: UnifiedBatchData = {
    header: {
      id_batch: 'BATCH-001',
      target_entity_type: 'person',
      atomicity_policy: 'PARTIAL_ALLOW_VALID',
      lifecycle_status: 'VALIDATED',
      total_rows: 3,
      valid_rows: 1,
      invalid_rows: 1,
      committed_rows: 1,
      failed_rows: 0,
      created_at: '2026-08-01T10:00:00Z',
      completed_at: null
    },
    staging_rows: [
      {
        id_staging: 'STG-001',
        batch_id: 'BATCH-001',
        row_number: 1,
        row_status: 'COMMITTED',
        payload: { nama_lengkap: 'Budi Santoso', no_anggota: 'JMT-001' },
        error_code: null,
        error_message: null,
        reconciliation_notes: null,
        created_at: '2026-08-01T10:00:00Z'
      },
      {
        id_staging: 'STG-002',
        batch_id: 'BATCH-001',
        row_number: 2,
        row_status: 'INVALID',
        payload: { nama_lengkap: '', no_anggota: 'JMT-002' },
        error_code: 'MISSING_REQUIRED_FIELD',
        error_message: 'Field nama_lengkap wajib diisi.',
        reconciliation_notes: 'Isi nama anggota',
        created_at: '2026-08-01T10:00:00Z'
      },
      {
        id_staging: 'STG-003',
        batch_id: 'BATCH-001',
        row_number: 3,
        row_status: 'PROCESSING',
        payload: { nama_lengkap: 'Siti Rahma', no_anggota: 'JMT-003' },
        error_code: null,
        error_message: null,
        reconciliation_notes: null,
        created_at: '2026-08-01T10:00:00Z'
      }
    ],
    chunk_config: {
      chunkSize: 100,
      continueOnError: true
    },
    validation_summary: {
      batch_id: 'BATCH-001',
      total_evaluated: 3,
      valid_count: 1,
      invalid_count: 1,
      can_execute: true,
      validation_errors: [
        { row_number: 2, error_code: 'MISSING_REQUIRED_FIELD', error_message: 'Field nama_lengkap wajib diisi.' }
      ]
    }
  };

  // Test 1: Batch Row Status Preservation (including PROCESSING state)
  console.log("Test 1: Batch Row Status Preservation (including PROCESSING state)");
  const vm = adaptBatchProcessingToViewModel(mockBatchData);

  assert.strictEqual(vm.rows.length, 3);
  assert.strictEqual(vm.rows[0].statusLabel, 'Berhasil Di-Mutasi');
  assert.strictEqual(vm.rows[1].statusLabel, 'Data Tidak Valid');
  assert.strictEqual(vm.rows[2].statusLabel, 'Sedang Diproses...');
  console.log("   ✅ Passed: Batch row statuses (including PROCESSING) mapped correctly.");

  // Test 2: Atomicity Policy & Metrics Projection
  console.log("Test 2: Atomicity Policy & Metrics Projection");
  assert.strictEqual(vm.summaryMetrics.atomicityPolicyLabel, 'Izinkan Mutasi Parsial (PARTIAL_ALLOW_VALID)');
  assert.strictEqual(vm.summaryMetrics.progressPercentFormatted, '33%');
  assert.strictEqual(vm.canExecuteBatch, true);
  console.log("   ✅ Passed: Atomicity policy and progress percentage projected correctly.");

  // Test 3: Reconciliation Items Extraction
  console.log("Test 3: Reconciliation Items Extraction");
  assert.strictEqual(vm.reconciliationItems.length, 1);
  assert.strictEqual(vm.reconciliationItems[0].rowNumberFormatted, 'Baris #2');
  assert.strictEqual(vm.reconciliationItems[0].error_code, 'MISSING_REQUIRED_FIELD');
  console.log("   ✅ Passed: Reconciliation items filtered and projected correctly.");

  // Test 4: Pure Adapter Invariants (0 Parser / 0 Supabase / 0 Auth Logic)
  console.log("Test 4: Pure Adapter Invariants (0 Parser / 0 Supabase / 0 Auth Logic)");
  const jsonStr = JSON.stringify(vm);
  assert.strictEqual(jsonStr.includes('supabase'), false, "supabase reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('papaparse'), false, "papaparse reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('xlsx'), false, "xlsx reference MUST NOT exist");
  assert.strictEqual(jsonStr.includes('role'), false, "role MUST NOT exist");
  console.log("   ✅ Passed: Zero parser/supabase references or auth logic in ViewModel payload.");

  console.log("\n🎉 ALL F10 BATCH ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runBatchAdapterUnitTests();
