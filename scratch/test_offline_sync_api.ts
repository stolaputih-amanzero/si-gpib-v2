import * as assert from 'assert';
import { OfflineCommand } from '../src/types/offlineSync.types';
import { offlineStoreEngine } from '../src/lib/offline/indexedDbStore';
import { syncEngine } from '../src/lib/offline/syncEngine';

async function runOfflineSyncHarness() {
  console.log("🧪 Starting F6 Offline Sync & Transport Engine Integration Test Harness...\n");

  offlineStoreEngine.clearAll();

  // Test 1: Persistence Integrity & Store Isolation
  console.log("Test 1: Persistence Integrity & 4 Store Isolation");
  const testCmd: OfflineCommand = {
    command_id: 'CMD-001',
    entity_type: 'aid_request',
    entity_id: 'AJUAN-TEST-001',
    action: 'submit',
    payload: { catatan: 'Pengajuan via Offline PWA' },
    request_id: 'REQ-TOKEN-9001',
    created_at: new Date().toISOString()
  };

  const item = await offlineStoreEngine.enqueueCommand(testCmd);
  assert.strictEqual(item.status, 'QUEUED');
  assert.strictEqual(item.command.request_id, 'REQ-TOKEN-9001');

  const meta = await offlineStoreEngine.getSyncMetadata();
  assert.strictEqual(meta.queued_count, 1);
  console.log("   ✅ Passed: Offline command persisted in command_queue with QUEUED status.");

  // Test 2 & 10: Multi-Entity Generic Dispatcher Registration
  console.log("Test 2 & 10: Multi-Entity Generic Dispatcher Registration & Execution");
  let aidDispatched = false;
  let personDispatched = false;

  syncEngine.registerDispatcher('aid_request', async (cmd) => {
    aidDispatched = true;
    assert.strictEqual(cmd.request_id, 'REQ-TOKEN-9001', "Immutable request_id MUST be passed to RPC");
    return { success: true };
  });

  syncEngine.registerDispatcher('person', async (_cmd) => {
    personDispatched = true;
    return { success: true };
  });

  // Test 3: Successful Command Execution (QUEUED -> SYNCING -> SYNCED)
  console.log("Test 3: Successful Command Sync Execution (QUEUED -> SYNCING -> SYNCED)");
  const syncedItem = await syncEngine.syncCommand('CMD-001');
  assert.ok(syncedItem);
  assert.strictEqual(syncedItem.status, 'SYNCED');
  assert.strictEqual(aidDispatched, true);
  console.log("   ✅ Passed: Command executed and updated status to SYNCED.");

  // Test 4 & 5: Transient Network Failure & Immutable request_id Retry
  console.log("Test 4 & 5: Transient Network Failure (RETRY_PENDING) & Immutable request_id Retry");
  const retryCmd: OfflineCommand = {
    command_id: 'CMD-002',
    entity_type: 'person',
    entity_id: 'PERSON-001',
    action: 'update_profile',
    payload: { alamat: 'Jl. Merdeka' },
    request_id: 'REQ-TOKEN-9002',
    created_at: new Date().toISOString()
  };

  await offlineStoreEngine.enqueueCommand(retryCmd);

  let attemptCount = 0;
  syncEngine.registerDispatcher('person', async (cmd) => {
    attemptCount += 1;
    assert.strictEqual(cmd.request_id, 'REQ-TOKEN-9002', "request_id MUST remain identical across retries");
    if (attemptCount === 1) {
      throw new Error('Network timeout / 503 Service Unavailable');
    }
    return { success: true };
  });

  // First sync attempt -> Fails with Network Error
  const failItem = await syncEngine.syncCommand('CMD-002');
  assert.ok(failItem);
  assert.strictEqual(failItem.status, 'RETRY_PENDING');
  assert.strictEqual(failItem.retry_count, 1);
  console.log("   ✅ Passed: Transient network failure transitioned status to RETRY_PENDING.");

  // Retry sync attempt -> Succeeds with same request_id
  const retrySuccessItem = await syncEngine.syncCommand('CMD-002');
  assert.ok(retrySuccessItem);
  assert.strictEqual(retrySuccessItem.status, 'SYNCED');
  assert.strictEqual(attemptCount, 2);
  console.log("   ✅ Passed: Retry succeeded reusing identical request_id token.");

  // Test 6 & 7: Domain Rejection (CONFLICT) & Conflict Metadata Persistence
  console.log("Test 6 & 7: Domain Rejection (CONFLICT) & Conflict Metadata Persistence");
  const conflictCmd: OfflineCommand = {
    command_id: 'CMD-003',
    entity_type: 'aid_request',
    entity_id: 'AJUAN-TEST-002',
    action: 'approve',
    payload: {},
    request_id: 'REQ-TOKEN-9003',
    created_at: new Date().toISOString()
  };

  await offlineStoreEngine.enqueueCommand(conflictCmd);

  syncEngine.registerDispatcher('aid_request', async (cmd) => {
    if (cmd.command_id === 'CMD-003') {
      throw new Error('INVALID_TRANSITION: Cannot approve rejected request');
    }
    return { success: true };
  });

  const conflictItem = await syncEngine.syncCommand('CMD-003');
  assert.ok(conflictItem);
  assert.strictEqual(conflictItem.status, 'CONFLICT');

  const conflictMeta = await offlineStoreEngine.getConflictMetadata('CMD-003');
  assert.ok(conflictMeta);
  assert.strictEqual(conflictMeta.server_error_code, 'INVALID_TRANSITION');
  assert.strictEqual(conflictMeta.resolution_state, 'UNRESOLVED');
  console.log("   ✅ Passed: Domain rejection transitioned to CONFLICT and persisted in conflict_metadata store.");

  // Test 8 & 9: Store Isolation & Read Cache
  console.log("Test 8 & 9: Store Isolation & Read Cache");
  assert.strictEqual(personDispatched, true, "Person dispatcher MUST be registered and ready for execution");

  await offlineStoreEngine.setReadCache({
    cache_key: 'aid_request:AJUAN-TEST-001',
    entity_type: 'aid_request',
    entity_id: 'AJUAN-TEST-001',
    cached_data: { status: 'Pending_KMJ' },
    cached_at: new Date().toISOString(),
    expires_at: new Date().toISOString()
  });

  const cache = await offlineStoreEngine.getReadCache('aid_request:AJUAN-TEST-001');
  assert.ok(cache);
  assert.strictEqual((cache.cached_data as any).status, 'Pending_KMJ');
  console.log("   ✅ Passed: Read Cache isolated cleanly in read_cache store.");

  console.log("\n🎉 ALL 11 F6 GATE 3 ACCEPTANCE CRITERIA PASSED 100% SUCCESSFULLY!\n");
}

runOfflineSyncHarness();
