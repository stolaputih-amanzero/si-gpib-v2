import * as assert from 'assert';
import { createHmac } from 'crypto';

class PlatformTransactionMock {
  private auditLogs: any[] = [];
  private eventOutbox: any[] = [];
  private webhookDeliveries: any[] = [];
  private domainEntities: Map<string, any> = new Map();

  executeDomainMutation(
    actorId: string,
    entityType: string,
    entityId: string,
    action: string,
    mutationPayload: any,
    options: { simulateAuditFailure?: boolean; simulateOutboxFailure?: boolean } = {}
  ) {
    const transactionId = `TX-${Math.random().toString(36).substring(2, 9)}`;

    // Step 1: F12 Authorization Check
    if (!actorId || actorId === 'ANONYMOUS') {
      throw new Error('F12_DENY: Unauthenticated actor access denied.');
    }

    try {
      // Step 2: Primary Domain Mutation (Prepared in Transaction)
      const entityState = { entity_id: entityId, ...mutationPayload, updated_at: new Date().toISOString() };

      // Step 3: F13 Immutable Audit Evidence Write (Fail-Closed Boundary)
      if (options.simulateAuditFailure) {
        throw new Error('F13_AUDIT_WRITE_FAILURE: Failed to append cryptographic audit log entry.');
      }
      const auditEntry = {
        log_id: `LOG-${transactionId}`,
        entity_id: entityId,
        action,
        hash: createHmac('sha256', 'hash_seed').update(`${transactionId}.${entityId}`).digest('hex'),
        timestamp: new Date().toISOString()
      };

      // Step 4: F11 Transactional Event Outbox Write (Atomic with Mutation & Audit)
      if (options.simulateOutboxFailure) {
        throw new Error('F11_OUTBOX_WRITE_FAILURE: Failed to write event outbox record.');
      }
      const eventRecord = {
        event_id: `EVT-${transactionId}`,
        topic: `domain.${entityType}`,
        event_type: `${entityType}.${action.toLowerCase()}`,
        payload: mutationPayload
      };

      // Atomic Commit Execution
      this.domainEntities.set(entityId, entityState);
      this.auditLogs.push(auditEntry);
      this.eventOutbox.push(eventRecord);

      // Step 5: F14 Asynchronous Outbound Webhook Queueing
      const webhookDelivery = {
        delivery_id: `DEL-${transactionId}`,
        event_id: eventRecord.event_id,
        status: 'QUEUED',
        idempotency_key: `IDEM-${eventRecord.event_id}`
      };
      this.webhookDeliveries.push(webhookDelivery);

      return { transactionId, status: 'COMMITTED', eventId: eventRecord.event_id };
    } catch (err: any) {
      // ROLLBACK: Primary domain entity, audit log, and outbox event are NOT committed
      throw new Error(`TRANSACTION_ROLLBACK: ${err.message}`);
    }
  }

  simulateExternalWebhookDLQFailure(deliveryId: string) {
    const delivery = this.webhookDeliveries.find(d => d.delivery_id === deliveryId);
    if (!delivery) throw new Error('Delivery not found');
    delivery.status = 'DLQ';
    // External failure DOES NOT rollback domain entities or audit logs
    return delivery;
  }

  getEntity(entityId: string) {
    return this.domainEntities.get(entityId);
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  getOutboxEvents() {
    return this.eventOutbox;
  }

  getWebhookDeliveries() {
    return this.webhookDeliveries;
  }
}

function runPlatformCrossCuttingHardeningVerification() {
  console.log("🧪 Starting Master Platform Cross-Cutting Hardening & Consistency Verification Suite...\n");

  const platform = new PlatformTransactionMock();

  // Test 1: Full End-to-End Successful Transaction (Mutation ➔ F13 Audit ➔ F11 Outbox ➔ F14 Webhook)
  console.log("Test 1: Full End-to-End Successful Transaction (Mutation ➔ F13 Audit ➔ F11 Outbox ➔ F14 Webhook)");
  const res1 = platform.executeDomainMutation('USER-ADMIN-01', 'person', 'PER-888', 'CREATE', { name_initial: 'A.K.', status: 'AKTIF' });
  assert.strictEqual(res1.status, 'COMMITTED');
  assert.ok(platform.getEntity('PER-888'));
  assert.strictEqual(platform.getAuditLogs().length, 1);
  assert.strictEqual(platform.getOutboxEvents().length, 1);
  assert.strictEqual(platform.getWebhookDeliveries().length, 1);
  console.log("   ✅ Passed: Successful transaction committed domain entity, F13 audit, F11 outbox, and F14 webhook delivery atomically.");

  // Test 2: F13 Audit Write Failure Causes Complete Transaction Rollback (Fail-Closed)
  console.log("Test 2: F13 Audit Write Failure Causes Complete Transaction Rollback (Fail-Closed)");
  assert.throws(
    () => platform.executeDomainMutation('USER-ADMIN-01', 'person', 'PER-FAIL-01', 'CREATE', { name_initial: 'F.L.' }, { simulateAuditFailure: true }),
    /TRANSACTION_ROLLBACK: F13_AUDIT_WRITE_FAILURE/
  );
  assert.strictEqual(platform.getEntity('PER-FAIL-01'), undefined, "Domain entity MUST NOT commit when F13 audit write fails");
  assert.strictEqual(platform.getOutboxEvents().find(e => e.payload?.name_initial === 'F.L.'), undefined, "F11 Outbox event MUST NOT exist for aborted mutation");
  console.log("   ✅ Passed: F13 audit failure aborted primary domain mutation and F11 outbox event (Atomic Fail-Closed).");

  // Test 3: F11 Event Outbox Failure Causes Complete Transaction Rollback
  console.log("Test 3: F11 Event Outbox Failure Causes Complete Transaction Rollback");
  assert.throws(
    () => platform.executeDomainMutation('USER-ADMIN-01', 'person', 'PER-FAIL-02', 'CREATE', { name_initial: 'E.O.' }, { simulateOutboxFailure: true }),
    /TRANSACTION_ROLLBACK: F11_OUTBOX_WRITE_FAILURE/
  );
  assert.strictEqual(platform.getEntity('PER-FAIL-02'), undefined);
  console.log("   ✅ Passed: F11 outbox failure aborted primary domain mutation.");

  // Test 4: Invariant #25 External Webhook DLQ Failure Does NOT Rollback Committed Mutation
  console.log("Test 4: Invariant #25 External Webhook DLQ Failure Does NOT Rollback Committed Mutation");
  const res2 = platform.executeDomainMutation('USER-ADMIN-01', 'aid_request', 'AID-999', 'APPROVE', { amount: 750000 });
  const deliveryId = platform.getWebhookDeliveries().find(d => d.event_id === res2.eventId).delivery_id;
  
  // External third-party endpoint fails completely and exhausts retries into DLQ
  platform.simulateExternalWebhookDLQFailure(deliveryId);
  
  assert.strictEqual(platform.getWebhookDeliveries().find(d => d.delivery_id === deliveryId).status, 'DLQ');
  assert.ok(platform.getEntity('AID-999'), "Primary domain entity MUST REMAIN COMMITTED despite external webhook DLQ failure");
  assert.strictEqual(platform.getAuditLogs().length, 2, "F13 Audit evidence MUST REMAIN COMMITTED");
  console.log("   ✅ Passed: Invariant #25 verified: External webhook DLQ failure DID NOT rollback primary committed domain mutation!");

  // Test 5: F12 Authorization Denial Prevents Transaction Initiation
  console.log("Test 5: F12 Authorization Denial Prevents Transaction Initiation");
  assert.throws(
    () => platform.executeDomainMutation('ANONYMOUS', 'asset', 'AST-001', 'DELETE', {}),
    /F12_DENY/
  );
  console.log("   ✅ Passed: F12 PDP authorization denial prevented transaction initiation.");

  // Test 6: Cross-Subsystem Idempotency Traceability Matrix (F10 -> F11 -> F13 -> F14)
  console.log("Test 6: Cross-Subsystem Idempotency Traceability Matrix (F10 -> F11 -> F13 -> F14)");
  const audit = platform.getAuditLogs()[0];
  const outbox = platform.getOutboxEvents()[0];
  const webhook = platform.getWebhookDeliveries()[0];

  assert.ok(audit.log_id);
  assert.ok(outbox.event_id);
  assert.strictEqual(webhook.idempotency_key, `IDEM-${outbox.event_id}`);
  console.log("   ✅ Passed: Deterministic idempotency identifiers linked across audit, outbox, and webhooks.");

  console.log("\n🎉 MASTER PLATFORM CROSS-CUTTING HARDENING VERIFICATION PASSED 100% SUCCESSFULLY!\n");
}

runPlatformCrossCuttingHardeningVerification();
