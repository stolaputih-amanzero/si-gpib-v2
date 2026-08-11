export type BatchLifecycleStatus = 
  | 'UPLOADED' 
  | 'VALIDATING' 
  | 'VALIDATED' 
  | 'EXECUTING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'RECONCILED';

export type BatchRowStatus = 
  | 'STAGED' 
  | 'VALID' 
  | 'INVALID' 
  | 'PROCESSING' 
  | 'COMMITTED' 
  | 'FAILED';

export type BatchAtomicityPolicy = 
  | 'ALL_OR_NOTHING' 
  | 'PARTIAL_ALLOW_VALID';

export interface BatchChunkConfig {
  chunkSize: number;
  continueOnError: boolean;
}

export interface BatchHeaderRecord {
  id_batch: string;
  target_entity_type: string;
  atomicity_policy: BatchAtomicityPolicy;
  lifecycle_status: BatchLifecycleStatus;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  committed_rows: number;
  failed_rows: number;
  created_by?: string;
  created_at: string;
  completed_at?: string | null;
}

export interface BatchStagingRowRecord {
  id_staging: string;
  batch_id: string;
  row_number: number;
  row_status: BatchRowStatus;
  payload: Record<string, any>;
  error_code: string | null;
  error_message: string | null;
  reconciliation_notes: string | null;
  created_at: string;
}

export interface BatchValidationResult {
  batch_id: string;
  total_evaluated: number;
  valid_count: number;
  invalid_count: number;
  can_execute: boolean;
  validation_errors: Array<{
    row_number: number;
    error_code: string;
    error_message: string;
  }>;
}

export interface BatchExecutionResult {
  batch_id: string;
  chunk_index: number;
  total_chunks: number;
  rows_processed: number;
  rows_committed: number;
  rows_failed: number;
  is_batch_completed: boolean;
}

export interface UnifiedBatchData {
  header: BatchHeaderRecord;
  staging_rows: BatchStagingRowRecord[];
  chunk_config: BatchChunkConfig;
  validation_summary: BatchValidationResult;
}

// Utility function validating state transition rules
export function isValidBatchRowTransition(currentStatus: BatchRowStatus, nextStatus: BatchRowStatus): boolean {
  const allowedTransitions: Record<BatchRowStatus, BatchRowStatus[]> = {
    STAGED: ['VALID', 'INVALID', 'FAILED'],
    VALID: ['PROCESSING', 'INVALID', 'FAILED'],
    INVALID: ['STAGED', 'VALID'], // Can be edited/reconciled back to STAGED or VALID
    PROCESSING: ['COMMITTED', 'FAILED'],
    COMMITTED: [], // Terminal State (Immutable)
    FAILED: ['STAGED', 'VALID', 'PROCESSING'] // Re-run / Retry State
  };

  return allowedTransitions[currentStatus]?.includes(nextStatus) || false;
}
