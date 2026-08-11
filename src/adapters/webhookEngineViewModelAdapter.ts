import { WebhookEndpointDefinition, WebhookDeliveryRecord } from '@/types/webhookEngine.types';
import { 
  WebhookWorkspaceViewModel, 
  WebhookEndpointViewModel, 
  WebhookDeliveryItemViewModel, 
  WebhookEngineMetricsViewModel 
} from '@/types/webhookEngineViewModel.types';

export function adaptWebhookEngineToViewModel(
  endpoints: WebhookEndpointDefinition[],
  deliveries: WebhookDeliveryRecord[]
): WebhookWorkspaceViewModel {
  const adaptedEndpoints: WebhookEndpointViewModel[] = endpoints.map(ep => {
    const isSecretPresent = (ep as any).secret_key !== undefined;
    if (isSecretPresent) {
      throw new Error('SECURITY_VIOLATION: secret_key MUST NOT be passed to ViewModel adapter.');
    }

    return {
      endpoint_id: ep.endpoint_id,
      target_url: ep.target_url,
      description: ep.description,
      subscribedEventsFormatted: ep.subscribed_events.join(', '),
      statusBadge: ep.is_active 
        ? { label: 'AKTIF', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' }
        : { label: 'NON-AKTIF', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },
      maxRetriesFormatted: `${ep.delivery_policy.max_retries} Retries`,
      timeoutFormatted: `${ep.delivery_policy.timeout_ms / 1000}s Timeout`,
      is_active: ep.is_active
    };
  });

  const adaptedDeliveries: WebhookDeliveryItemViewModel[] = deliveries.map(del => {
    let statusLabel = 'MENUNGGU (QUEUED)';
    let statusBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';
    let isDLQ = false;

    switch (del.status) {
      case 'DELIVERED':
        statusLabel = 'TERKIRIM (DELIVERED)';
        statusBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300';
        break;
      case 'FAILED_RETRYING':
        statusLabel = 'RETRYING (PERCOBAAN ULANG)';
        statusBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
        break;
      case 'DLQ':
        statusLabel = 'DLQ (DEAD-LETTER QUEUE)';
        statusBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 animate-pulse';
        isDLQ = true;
        break;
      case 'DELIVERING':
        statusLabel = 'MENGIRIM...';
        statusBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300';
        break;
      case 'CANCELLED':
        statusLabel = 'DIBATALKAN';
        statusBadgeColor = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
        break;
    }

    return {
      delivery_id: del.delivery_id,
      endpoint_id: del.endpoint_id,
      event_id: del.event_id,
      topic: del.topic,
      statusLabel,
      statusBadgeColor,
      attemptsFormatted: `${del.current_attempt} / ${del.max_attempts}`,
      nextRetryFormatted: del.next_retry_at ? new Date(del.next_retry_at).toLocaleTimeString() : '-',
      queuedAtFormatted: new Date(del.queued_at).toLocaleTimeString(),
      deliveredAtFormatted: del.delivered_at ? new Date(del.delivered_at).toLocaleTimeString() : '-',
      isDLQ
    };
  });

  const totalEndpoints = endpoints.length;
  const activeEndpoints = endpoints.filter(e => e.is_active).length;
  const totalDeliveries = deliveries.length;
  const successfulDeliveries = deliveries.filter(d => d.status === 'DELIVERED').length;
  const retryingDeliveries = deliveries.filter(d => d.status === 'FAILED_RETRYING').length;
  const dlqDeliveries = deliveries.filter(d => d.status === 'DLQ').length;

  let overallHealthStatus = '100% OPERASIONAL (WEBHOOK HEALTHY)';
  let overallHealthBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (dlqDeliveries > 0) {
    overallHealthStatus = `PERINGATAN: ${dlqDeliveries} DELIVERY MASUK DLQ`;
    overallHealthBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (retryingDeliveries > 0) {
    overallHealthStatus = `PERHATIAN: ${retryingDeliveries} DELIVERY DALAM RETRY`;
    overallHealthBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const metrics: WebhookEngineMetricsViewModel = {
    totalEndpoints,
    activeEndpoints,
    totalDeliveries,
    successfulDeliveries,
    retryingDeliveries,
    dlqDeliveries,
    overallHealthStatus,
    overallHealthBadgeColor
  };

  return {
    endpoints: adaptedEndpoints,
    recentDeliveries: adaptedDeliveries,
    metrics
  };
}
