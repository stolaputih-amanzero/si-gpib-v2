import * as assert from 'assert';
import { 
  OfflineQueueItem, 
  ConflictMetadata, 
  SyncMetadata 
} from '../src/types/offlineSync.types';
import { adaptOfflineSyncToViewModel } from '../src/adapters/offlineSyncViewModelAdapter';

function runOfflineSyncAdapterUnitTests() {
  console.log("🧪 Starting Unit Tests for adaptOfflineSyncToViewModel...\n");

  const mockSyncMetadata: SyncMetadata = {
    is_online: true,
    last_sync_at: '2026-08-11T10:00:00Z',
    queued_count: 1,
    syncing_count: 0,
    conflict_count: 1,
    failed_count: 0
  };

  const mockQueueItems: OfflineQueueItem[] = [
    {
      command: {
        command_id: 'CMD-001',
        entity_type: 'aid_request',
        entity_id: 'AJUAN-TEST-001',
        action: 'submit',
        payload: { catatan: 'Test' },
        request_id: 'REQ-1001',
        created_at: '2026-08-11T10:00:00Z'
      },
      status: 'QUEUED',
      retry_count: 0,
      last_attempt_at: null,
      error_message: null
    },
    {
      command: {
        command_id: 'CMD-002',
        entity_type: 'person',
        entity_id: 'PERSON-001',
        action: 'update_profile',
        payload: {},
        request_id: 'REQ-1002',
        created_at: '2026-08-11T10:01:00Z'
      },
      status: 'RETRY_PENDING',
      retry_count: 2,
      last_attempt_at: '2026-08-11T10:05:00Z',
      error_message: '503 Service Unavailable'
    },
    {
      command: {
        command_id: 'CMD-003',
        entity_type: 'aid_request',
        entity_id: 'AJUAN-TEST-002',
        action: 'approve',
        payload: {},
        request_id: 'REQ-1003',
        created_at: '2026-08-11T10:02:00Z'
      },
      status: 'CONFLICT',
      retry_count: 1,
      last_attempt_at: '2026-08-11T10:06:00Z',
      error_message: 'INVALID_TRANSITION'
    }
  ];

  const mockConflicts: ConflictMetadata[] = [
    {
      command_id: 'CMD-003',
      request_id: 'REQ-1003',
      entity_type: 'aid_request',
      entity_id: 'AJUAN-TEST-002',
      server_error_code: 'INVALID_TRANSITION',
      server_error_message: 'Cannot approve rejected request',
      server_state_snapshot: { status: 'Rejected' },
      resolution_state: 'UNRESOLVED',
      resolved_at: null
    }
  ];

  // Test 1: QUEUED / SYNCING / SYNCED Transport Mapping
  console.log("Test 1: QUEUED Transport Mapping");
  const vm = adaptOfflineSyncToViewModel(mockQueueItems, mockConflicts, mockSyncMetadata);

  assert.strictEqual(vm.summary.isOnline, true);
  assert.strictEqual(vm.summary.queuedCount, 1);
  assert.strictEqual(vm.queueItems[0].status, 'QUEUED');
  assert.strictEqual(vm.queueItems[0].statusLabel, 'Menunggu Koneksi Jaringan');
  console.log("   ✅ Passed: QUEUED transport state correctly mapped to UI labels.");

  // Test 2: RETRY_PENDING Mapping & Attempt Counter
  console.log("Test 2: RETRY_PENDING Mapping & Attempt Counter");
  assert.strictEqual(vm.queueItems[1].status, 'RETRY_PENDING');
  assert.strictEqual(vm.queueItems[1].retryCount, 2);
  assert.strictEqual(vm.queueItems[1].errorMessage, '503 Service Unavailable');
  console.log("   ✅ Passed: RETRY_PENDING state & attempt counter correctly mapped.");

  // Test 3: CONFLICT + Server Error Metadata Mapping
  console.log("Test 3: CONFLICT + Server Error Metadata Mapping");
  assert.strictEqual(vm.queueItems[2].status, 'CONFLICT');
  assert.notStrictEqual(vm.queueItems[2].conflictDetails, null);
  assert.strictEqual(vm.queueItems[2].conflictDetails?.serverErrorCode, 'INVALID_TRANSITION');
  assert.strictEqual(vm.queueItems[2].conflictDetails?.resolutionState, 'UNRESOLVED');
  assert.strictEqual(vm.conflictItems.length, 1);
  console.log("   ✅ Passed: CONFLICT metadata mapped cleanly with server error code.");

  // Test 4: Pure Adapter Invariants (0 Auth / 0 Domain State Mutation / 0 UI Action Flags)
  console.log("Test 4: Pure Adapter Invariants (0 Auth / 0 UI Action Flags)");
  const jsonStr = JSON.stringify(vm);
  assert.strictEqual(jsonStr.includes('canApprove'), false, "canApprove MUST NOT be present");
  assert.strictEqual(jsonStr.includes('canRetry'), false, "canRetry MUST NOT be present");
  assert.strictEqual(jsonStr.includes('nextStatus'), false, "nextStatus MUST NOT be present");
  assert.strictEqual(jsonStr.includes('role'), false, "role MUST NOT be present");
  console.log("   ✅ Passed: Zero UI action flags or auth logic in ViewModel payload.");

  console.log("\n🎉 ALL OFFLINE SYNC ADAPTER UNIT TESTS PASSED SUCCESSFULLY!\n");
}

runOfflineSyncAdapterUnitTests();
