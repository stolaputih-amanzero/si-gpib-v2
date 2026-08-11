import { computeWebhookHMACSignature, WebhookDeliveryRecord } from '@/types/webhookEngine.types';

export interface DispatcherOptions {
  timeoutMs?: number;
  maxAttempts?: number;
}

export interface DispatchResult {
  delivery_id: string;
  endpoint_id: string;
  status: 'DELIVERED' | 'FAILED_RETRYING' | 'DLQ';
  http_status?: number;
  latency_ms: number;
  attempt_number: number;
  response_snippet?: string;
}

export async function processSingleWebhookDelivery(
  delivery: WebhookDeliveryRecord & { target_url: string; secret_key: string; accepted_http_codes: number[]; timeout_ms: number },
  payloadStr: string,
  options: DispatcherOptions = {}
): Promise<DispatchResult> {
  const startTime = Date.now();
  const timestamp = Math.floor(startTime / 1000).toString();
  const signatureHeader = computeWebhookHMACSignature(delivery.secret_key, timestamp, payloadStr);
  const timeoutMs = delivery.timeout_ms || options.timeoutMs || 10000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let httpStatus: number | undefined;
  let responseSnippet: string | undefined;
  let outcome: 'SUCCESS' | 'HTTP_ERROR' | 'TIMEOUT' | 'NETWORK_ERROR' = 'SUCCESS';

  try {
    const res = await fetch(delivery.target_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GPIB-Signature': signatureHeader,
        'X-GPIB-Delivery-ID': delivery.delivery_id,
        'X-GPIB-Event-ID': delivery.event_id,
        'User-Agent': 'SI-GPIB-WebhookDispatcher/1.0'
      },
      body: payloadStr,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    httpStatus = res.status;
    const responseText = await res.text();
    responseSnippet = responseText.substring(0, 500);

    const isAccepted = delivery.accepted_http_codes.includes(res.status);
    if (isAccepted) {
      outcome = 'SUCCESS';
    } else {
      outcome = 'HTTP_ERROR';
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      outcome = 'TIMEOUT';
      responseSnippet = 'Request Aborted: Delivery Timeout';
    } else {
      outcome = 'NETWORK_ERROR';
      responseSnippet = `Network Failure: ${err.message}`;
    }
  }

  const latencyMs = Date.now() - startTime;
  const nextAttempt = delivery.current_attempt + 1;
  let finalStatus: 'DELIVERED' | 'FAILED_RETRYING' | 'DLQ' = 'DELIVERED';

  if (outcome === 'SUCCESS') {
    finalStatus = 'DELIVERED';
  } else {
    if (nextAttempt >= delivery.max_attempts) {
      finalStatus = 'DLQ';
    } else {
      finalStatus = 'FAILED_RETRYING';
    }
  }

  return {
    delivery_id: delivery.delivery_id,
    endpoint_id: delivery.endpoint_id,
    status: finalStatus,
    http_status: httpStatus,
    latency_ms: latencyMs,
    attempt_number: nextAttempt,
    response_snippet: responseSnippet
  };
}
