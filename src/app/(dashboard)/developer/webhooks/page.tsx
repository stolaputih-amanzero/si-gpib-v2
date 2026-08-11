import { Metadata } from 'next';
import { WebhookWorkspaceShell } from '@/components/developer/webhooks/WebhookWorkspaceShell';

export const metadata: Metadata = {
  title: 'Integrasi Eksternal & Webhook Reliability Delivery | SI-GPIB',
  description: 'Pengiriman event notifikasi outbound ke endpoint pihak ketiga dengan HMAC-SHA256 signing, retry backoff, dan isolasi DLQ.'
};

export default function WebhooksPage() {
  return <WebhookWorkspaceShell />;
}
