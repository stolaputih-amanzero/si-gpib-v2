import * as assert from 'assert';
import { UnifiedDocumentVaultData } from '../src/types/documentVault.types';
import { adaptDocumentVaultToViewModel, formatBytes } from '../src/adapters/documentVaultViewModelAdapter';

function runDocumentVaultAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptDocumentVaultToViewModel...\n");

  // Test 3: Total Size Humanized Formatter
  console.log("Test 3: Humanized Bytes Formatter Check");
  assert.strictEqual(formatBytes(512), '512 B');
  assert.strictEqual(formatBytes(524288), '512 KB');
  assert.strictEqual(formatBytes(1572864), '1.5 MB');
  console.log("   ✅ Passed: formatBytes correctly formats humanized file sizes.");

  const mockVaultData: UnifiedDocumentVaultData = {
    entity_type: 'aid_request',
    entity_id: 'AJUAN-TEST-001',
    total_count: 3,
    total_size_bytes: 2097152,
    documents: [
      {
        id_dokumen: 'DOC-001',
        entity_type: 'aid_request',
        entity_id: 'AJUAN-TEST-001',
        nama_file: 'proposal.pdf',
        storage_path: 'aid_request/AJUAN-TEST-001/DOC-001/proposal.pdf',
        size_bytes: 1572864,
        mime_type: 'application/pdf',
        visibility_tier: 'ORG_WIDE',
        sha256_checksum: 'HASH123',
        status: 'ACTIVE',
        created_at: '2026-08-11T10:00:00Z'
      },
      {
        id_dokumen: 'DOC-002',
        entity_type: 'aid_request',
        entity_id: 'AJUAN-TEST-001',
        nama_file: 'kuitansi.pdf',
        storage_path: 'aid_request/AJUAN-TEST-001/DOC-002/kuitansi.pdf',
        size_bytes: 524288,
        mime_type: 'application/pdf',
        visibility_tier: 'CONFIDENTIAL',
        sha256_checksum: null,
        status: 'PENDING_UPLOAD',
        created_at: '2026-08-11T10:05:00Z'
      },
      {
        id_dokumen: 'DOC-003',
        entity_type: 'aid_request',
        entity_id: 'AJUAN-TEST-001',
        nama_file: 'old_proposal.pdf',
        storage_path: 'aid_request/AJUAN-TEST-001/DOC-003/old_proposal.pdf',
        size_bytes: 1048576,
        mime_type: 'application/pdf',
        visibility_tier: 'PUBLIC',
        sha256_checksum: null,
        status: 'DELETED',
        created_at: '2026-08-11T09:00:00Z'
      }
    ]
  };

  // Test 1: ACTIVE & PENDING_UPLOAD Document Mapping
  console.log("Test 1: ACTIVE & PENDING_UPLOAD Document Mapping");
  const vm = adaptDocumentVaultToViewModel(mockVaultData);

  assert.strictEqual(vm.summary.entity_id, 'AJUAN-TEST-001');
  assert.strictEqual(vm.summary.totalCount, 2, "DELETED documents MUST be filtered from active view");
  assert.strictEqual(vm.summary.activeCount, 1);
  assert.strictEqual(vm.summary.pendingCount, 1);
  assert.strictEqual(vm.documents[0].sizeFormatted, '1.5 MB');
  assert.strictEqual(vm.documents[0].statusLabel, 'Aktif Terkonfirmasi');
  console.log("   ✅ Passed: Document ViewModel summary and items mapped correctly.");

  // Test 2: DELETED Document Filtering
  console.log("Test 2: DELETED Document Filtering");
  assert.strictEqual(vm.documents.some(d => d.id_dokumen === 'DOC-003'), false);
  console.log("   ✅ Passed: Soft-deleted document excluded from active ViewModel list.");

  // Test 4: Pure Adapter Invariants (0 Auth / 0 UI Action Flags)
  console.log("Test 4: Pure Adapter Invariants (0 Auth / 0 UI Action Flags)");
  const jsonStr = JSON.stringify(vm);
  assert.strictEqual(jsonStr.includes('canDownload'), false, "canDownload MUST NOT be present");
  assert.strictEqual(jsonStr.includes('canDelete'), false, "canDelete MUST NOT be present");
  assert.strictEqual(jsonStr.includes('canUpload'), false, "canUpload MUST NOT be present");
  assert.strictEqual(jsonStr.includes('role'), false, "role MUST NOT be present");
  console.log("   ✅ Passed: Zero UI action flags or auth logic in ViewModel payload.");

  console.log("\n🎉 ALL DOCUMENT VAULT ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runDocumentVaultAdapterUnitTests();
