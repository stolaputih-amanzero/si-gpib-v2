export interface WebhookEndpointViewModel {
  endpoint_id: string;
  target_url: string;
  description: string;
  subscribedEventsFormatted: string;
  statusBadge: {
    label: string;
    color: string;
  };
  maxRetriesFormatted: string;
  timeoutFormatted: string;
  is_active: boolean;
}

export interface WebhookDeliveryItemViewModel {
  delivery_id: string;
  endpoint_id: string;
  event_id: string;
  topic: string;
  statusLabel: string;
  statusBadgeColor: string;
  attemptsFormatted: string;
  nextRetryFormatted: string;
  queuedAtFormatted: string;
  deliveredAtFormatted: string;
  isDLQ: boolean;
}

export interface WebhookEngineMetricsViewModel {
  totalEndpoints: number;
  activeEndpoints: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  retryingDeliveries: number;
  dlqDeliveries: number;
  overallHealthStatus: string;
  overallHealthBadgeColor: string;
}

export interface WebhookWorkspaceViewModel {
  endpoints: WebhookEndpointViewModel[];
  recentDeliveries: WebhookDeliveryItemViewModel[];
  metrics: WebhookEngineMetricsViewModel;
}
