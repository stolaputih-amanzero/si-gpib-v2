import { processSingleWebhookDelivery } from './webhookDispatcher.service';
import { WebhookDeliveryRecord } from '@/types/webhookEngine.types';

export interface WorkerConfig {
  workerId: string;
  concurrencyLimit?: number;
}

export class ConcurrentWebhookWorker {
  private workerId: string;
  private processedDeliveries: string[] = [];

  constructor(config: WorkerConfig) {
    this.workerId = config.workerId;
  }

  async claimAndProcessDelivery(
    deliveriesPool: (WebhookDeliveryRecord & { target_url: string; secret_key: string; accepted_http_codes: number[]; timeout_ms: number; claimed_by?: string })[],
    payloadStr: string
  ) {
    // Atomic Claim Simulation: FOR UPDATE SKIP LOCKED
    const unclaimed = deliveriesPool.find(d => d.status === 'QUEUED' && (!d.claimed_by || d.claimed_by.startsWith('DEAD-')));
    if (!unclaimed) return null;

    // Claim delivery for this worker instance
    unclaimed.claimed_by = this.workerId;
    this.processedDeliveries.push(unclaimed.delivery_id);

    const result = await processSingleWebhookDelivery(unclaimed, payloadStr);
    unclaimed.status = result.status;
    unclaimed.current_attempt = result.attempt_number;

    return {
      workerId: this.workerId,
      deliveryId: unclaimed.delivery_id,
      status: result.status,
      attemptNumber: result.attempt_number,
      httpStatus: result.http_status
    };
  }

  getWorkerId() { return this.workerId; }
  getProcessedCount() { return this.processedDeliveries.length; }
  getProcessedDeliveries() { return [...this.processedDeliveries]; }
}
