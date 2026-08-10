// src/lib/offline/dexie.ts
import Dexie, { type Table } from 'dexie';

export interface Draft {
  formKey: string;
  data: unknown;
  timestamp: number;
}

export interface DraftPhoto {
  id?: number;
  formKey: string;
  photoIndex: number;
  blob: Blob;
  timestamp: number;
}

export interface PendingSubmission {
  id?: number;
  requestId: string; 
  operationType: 'rpc' | 'insert' | 'update';
  targetIdentifier: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  lastError?: string;
  lastAttemptAt?: number;
  createdAt: number;
}

export interface PendingAttachment {
  id?: number;
  submissionId: number; // Merujuk ke id (auto-increment) dari PendingSubmission
  file: Blob;
  path: string;
  status: 'pending' | 'uploading' | 'done' | 'failed';
  attempts: number;
  lastError?: string;
  createdAt: number;
}

export interface DeadLetter {
  id?: number;
  requestId: string;
  operationType: 'rpc' | 'insert' | 'update';
  targetIdentifier: string;
  payload: Record<string, unknown>;
  failureReason: string;
  httpStatus?: number;
  errorCode?: string;
  attempts: number;
  createdAt: number;
  movedToDLQAt: number;
}

export interface QueuedMutationRecord {
  id?: string;          // UUID (client-generated)
  contractId: string;  // e.g., 'OC-PASTORAL-001'
  payload: any;        // Raw form data
  originContextId: string; // CRITICAL: Stamped at submission time
  timestamp: number;   // Unix timestamp
  retryCount: number;  // For exponential backoff
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  error_code?: string;
  error_detail?: string;
}

class SIOSDatabase extends Dexie {
  drafts!: Table<Draft, string>;
  draftPhotos!: Table<DraftPhoto, number>;
  pendingSubmissions!: Table<PendingSubmission, number>;
  pendingAttachments!: Table<PendingAttachment, number>;
  deadLetters!: Table<DeadLetter, number>;
  offlineQueue!: Table<QueuedMutationRecord, string>;

  constructor() {
    super('sigpib-offline');
    // Skema v5 identik dengan rules.md, v6 adds offlineQueue
    this.version(6).stores({
      drafts: 'formKey, timestamp',
      draftPhotos: '++id, [formKey+photoIndex], timestamp',
      pendingSubmissions: '++id, requestId, status, createdAt, lastAttemptAt',
      pendingAttachments: '++id, submissionId, status, createdAt',
      deadLetters: '++id, requestId, createdAt, movedToDLQAt',
      offlineQueue: 'id, contractId, originContextId, status, timestamp',
    });
  }
}

export const db = new SIOSDatabase();

if (typeof window !== 'undefined') {
  (window as any).__TEST_DB__ = db;
}
