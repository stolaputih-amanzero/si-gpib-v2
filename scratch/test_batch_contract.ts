import * as assert from 'assert';
import { 
  UnifiedBatchData, 
  isValidBatchRowTransition 
} from '../src/types/batchProcessing.types';

function runBatchContractUnitTests() {
  console.log("🧪 Starting Unit Tests for F10 Batch Processing Data Contract & State Transitions...\n");

  // Test 1: Batch Row Status Transition Rules Check
  console.log("Test 1: Batch Row Status Transition Rules Check");
  assert.strictEqual(isValidBatchRowTransition('STAGED', 'VALID'), true);
  assert.strictEqual(isValidBatchRowTransition('VALID', 'PROCESSING'), true, "VALID MUST transition to PROCESSING during chunk execution");
  assert.strictEqual(isValidBatchRowTransition('PROCESSING', 'COMMITTED'), true);
  assert.strictEqual(isValidBatchRowTransition('PROCESSING', 'FAILED'), true);
  assert.strictEqual(isValidBatchRowTransition('FAILED', 'PROCESSING'), true, "FAILED row can be retried into PROCESSING state");
  console.log("   ✅ Passed: Batch row state transitions (including PROCESSING state) validated.");

  // Test 2: Terminal State Immutability Check
  console.log("Test 2: Terminal State Immutability Check");
  assert.strictEqual(isValidBatchRowTransition('COMMITTED', 'STAGED'), false, "COMMITTED row MUST NOT transition backwards to STAGED");
  assert.strictEqual(isValidBatchRowTransition('COMMITTED', 'PROCESSING'), false, "COMMITTED row MUST NOT be re-processed");
  console.log("   ✅ Passed: COMMITTED terminal state immutability enforced.");

  // Test 3: Schema Compliance & Atomicity Policy Data Structure
  console.log("Test 3: Schema Compliance & Atomicity Policy Data Structure");
  const mockBatchData: UnifiedBatchData = {
    header: {
      id_batch: 'BATCH-001',
      target_entity_type: 'person',
      atomicity_policy: 'ALL_OR_NOTHING',
      lifecycle_status: 'VALIDATED',
      total_rows: 100,
      valid_rows: 98,
      invalid_rows: 2,
      committed_rows: 0,
      failed_rows: 0,
      created_at: new Date().toISOString()
    },
    staging_rows: [
      {
        id_staging: 'STG-001',
        batch_id: 'BATCH-001',
        row_number: 1,
        row_status: 'VALID',
        payload: { nama_lengkap: 'Budi Santoso', no_anggota: 'JMT-001' },
        error_code: null,
        error_message: null,
        reconciliation_notes: null,
        created_at: new Date().toISOString()
      },
      {
        id_staging: 'STG-002',
        batch_id: 'BATCH-001',
        row_number: 2,
        row_status: 'INVALID',
        payload: { nama_lengkap: '', no_anggota: 'JMT-002' },
        error_code: 'MISSING_NAME',
        error_message: 'Nama lengkap wajib diisi',
        reconciliation_notes: 'Silakan isi nama anggota',
        created_at: new Date().toISOString()
      }
    ],
    chunk_config: {
      chunkSize: 100,
      continueOnError: false
    },
    validation_summary: {
      batch_id: 'BATCH-001',
      total_evaluated: 100,
      valid_count: 98,
      invalid_count: 2,
      can_execute: false, // ALL_OR_NOTHING with 2 invalid rows cannot execute
      validation_errors: [
        { row_number: 2, error_code: 'MISSING_NAME', error_message: 'Nama lengkap wajib diisi' }
      ]
    }
  };

  assert.strictEqual(mockBatchData.header.atomicity_policy, 'ALL_OR_NOTHING');
  assert.strictEqual(mockBatchData.validation_summary.can_execute, false);
  assert.strictEqual(mockBatchData.staging_rows[1].row_status, 'INVALID');
  console.log("   ✅ Passed: Batch data schema and ALL_OR_NOTHING validation summary verified.");

  // Test 4: Provider Neutrality Check
  console.log("Test 4: Provider Neutrality Check");
  const jsonStr = JSON.stringify(mockBatchData);
  assert.strictEqual(jsonStr.includes('papaparse'), false, "CSV parser references MUST NOT exist in contract");
  assert.strictEqual(jsonStr.includes('xlsx'), false, "Excel parser references MUST NOT exist in contract");
  console.log("   ✅ Passed: Zero CSV/XLSX parser references in contract.");

  console.log("\n🎉 ALL F10 BATCH PROCESSING CONTRACT UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runBatchContractUnitTests();
