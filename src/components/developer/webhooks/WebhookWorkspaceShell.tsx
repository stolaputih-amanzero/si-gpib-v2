'use client';

import React, { useState } from 'react';
import { WebhookEndpointDefinition, WebhookDeliveryRecord } from '@/types/webhookEngine.types';
import { adaptWebhookEngineToViewModel } from '@/adapters/webhookEngineViewModelAdapter';
import { WebhookDeliveryItemViewModel } from '@/types/webhookEngineViewModel.types';
import { WebhookHeader } from './WebhookHeader';
import { WebhookMetricsGrid } from './WebhookMetricsGrid';
import { WebhookEndpointPanel } from './WebhookEndpointPanel';
import { WebhookDeliveryStreamPanel } from './WebhookDeliveryStreamPanel';
import { WebhookDLQInspectionModal } from './WebhookDLQInspectionModal';

interface WebhookWorkspaceShellProps {
  initialEndpoints?: WebhookEndpointDefinition[];
  initialDeliveries?: WebhookDeliveryRecord[];
}

export const WebhookWorkspaceShell: React.FC<WebhookWorkspaceShellProps> = ({
  initialEndpoints,
  initialDeliveries
}) => {
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDeliveryItemViewModel | null>(null);

  const sampleEndpoints: WebhookEndpointDefinition[] = initialEndpoints || [
    {
      endpoint_id: 'EP-SYNOD-001',
      target_url: 'https://api.synod-gpib.org/v1/webhooks/events',
      description: 'GPIB Synod Central Event Consumer Endpoint',
      subscribed_events: ['person.created', 'aid_request.approved'],
      delivery_policy: {
        max_retries: 5,
        initial_backoff_ms: 1000,
        max_backoff_ms: 60000,
        timeout_ms: 10000,
        accepted_http_codes: [200, 201, 202, 204]
      },
      is_active: true,
      version: '1.0.0',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      endpoint_id: 'EP-MUNICIPAL-002',
      target_url: 'https://api.kemendagri.go.id/v2/dukapil/notifications',
      description: 'Municipal Registration System Endpoint',
      subscribed_events: ['person.created', 'transfer.completed'],
      delivery_policy: {
        max_retries: 3,
        initial_backoff_ms: 1000,
        max_backoff_ms: 5000,
        timeout_ms: 2000,
        accepted_http_codes: [200, 201]
      },
      is_active: true,
      version: '1.0.0',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const sampleDeliveries: WebhookDeliveryRecord[] = initialDeliveries || [
    {
      delivery_id: 'DEL-WH-801',
      endpoint_id: 'EP-SYNOD-001',
      event_id: 'EVT-F11-901',
      topic: 'domain.aid_request',
      status: 'DELIVERED',
      current_attempt: 1,
      max_attempts: 5,
      idempotency_key: 'IDEM-EVT-F11-901-EP-SYNOD-001',
      queued_at: new Date(Date.now() - 60000).toISOString(),
      delivered_at: new Date(Date.now() - 59000).toISOString()
    },
    {
      delivery_id: 'DEL-WH-802',
      endpoint_id: 'EP-MUNICIPAL-002',
      event_id: 'EVT-F11-902',
      topic: 'domain.transfer',
      status: 'DLQ',
      current_attempt: 3,
      max_attempts: 3,
      idempotency_key: 'IDEM-EVT-F11-902-EP-MUNICIPAL-002',
      queued_at: new Date(Date.now() - 300000).toISOString(),
      dlq_at: new Date(Date.now() - 290000).toISOString()
    },
    {
      delivery_id: 'DEL-WH-803',
      endpoint_id: 'EP-SYNOD-001',
      event_id: 'EVT-F11-903',
      topic: 'domain.person',
      status: 'FAILED_RETRYING',
      current_attempt: 2,
      max_attempts: 5,
      next_retry_at: new Date(Date.now() + 15000).toISOString(),
      idempotency_key: 'IDEM-EVT-F11-903-EP-SYNOD-001',
      queued_at: new Date(Date.now() - 10000).toISOString()
    }
  ];

  const vm = adaptWebhookEngineToViewModel(sampleEndpoints, sampleDeliveries);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <WebhookHeader vm={vm} />

      <WebhookMetricsGrid vm={vm} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WebhookEndpointPanel endpoints={vm.endpoints} />
        </div>

        <div className="lg:col-span-2">
          <WebhookDeliveryStreamPanel
            deliveries={vm.recentDeliveries}
            onSelectDelivery={(del) => setSelectedDelivery(del)}
          />
        </div>
      </div>

      <WebhookDLQInspectionModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
      />
    </div>
  );
};
