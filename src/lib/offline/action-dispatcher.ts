// src/lib/offline/action-dispatcher.ts
import type { PendingSubmission } from './dexie';

import { createLogPastoralAction } from '@/lib/domains/pastoral/pastoral.service';
import { createAsetAction } from '@/lib/domains/aset/aset.service';
import { createAsetSchema } from '@/lib/domains/aset/aset.schema';

export async function dispatchSubmission(item: PendingSubmission) {
  // Kontrak klasifikasi error:
  // - ZodError / RBAC / 4xx  → permanen → DLQ
  // - network / 5xx / timeout → transient → retry backoff
  switch (item.targetIdentifier) {
    case 'create_log_pastoral':
      return createLogPastoralAction(item.payload);
    case 'create_aset': {
      const validated = createAsetSchema.parse(item.payload);
      return createAsetAction(validated);
    }
    default:
      throw new Error(`No handler registered for: ${item.targetIdentifier}`);
  }
}
