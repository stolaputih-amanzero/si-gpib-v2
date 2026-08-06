import Dexie, { type Table } from 'dexie';

export interface Draft {
  formKey: string;
  data: unknown;
  timestamp: number;
}

export interface DraftPhoto {
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
  createdAt: number;
}

export interface PendingAttachment {
  id?: number;
  submissionId: number; // Foreign key referencing PendingSubmission.id
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

class SIOSDatabase extends Dexie {
  drafts!: Table<Draft, string>;
  draftPhotos!: Table<DraftPhoto>;
  pendingSubmissions!: Table<PendingSubmission>;
  pendingAttachments!: Table<PendingAttachment>;
  deadLetters!: Table<DeadLetter>;

  constructor() {
    super('sios-offline-db');
    this.version(5).stores({
      drafts: 'formKey, timestamp',
      draftPhotos: '[formKey+photoIndex], formKey, timestamp',
      pendingSubmissions: '++id, requestId, status, operationType, createdAt',
      pendingAttachments: '++id, submissionId, status, createdAt',
      deadLetters: '++id, requestId, targetIdentifier, movedToDLQAt',
    });
  }
}

export const db = new SIOSDatabase();
