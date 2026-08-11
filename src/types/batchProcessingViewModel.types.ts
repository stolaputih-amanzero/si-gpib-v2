import { 
  BatchRowStatus, 
  BatchAtomicityPolicy, 
  BatchLifecycleStatus 
} from '@/types/batchProcessing.types';

export interface BatchRowItemViewModel {
  id_staging: string;
  rowNumberFormatted: string;
  row_status: BatchRowStatus;
  statusLabel: string;
  statusBadgeColor: string;
  displayPayload: Array<{ key: string; label: string; value: string }>;
  error_code: string | null;
  error_message: string | null;
  reconciliation_notes: string | null;
  hasError: boolean;
}

export interface BatchSummaryMetrics {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  committedCount: number;
  failedCount: number;
  progressPercent: number;
  progressPercentFormatted: string;
  atomicityPolicy: BatchAtomicityPolicy;
  atomicityPolicyLabel: string;
  atomicityPolicyBadgeColor: string;
  lifecycleStatus: BatchLifecycleStatus;
  lifecycleStatusLabel: string;
  lifecycleStatusBadgeColor: string;
}

export interface BatchProcessingWorkspaceViewModel {
  id_batch: string;
  target_entity_type: string;
  targetEntityLabel: string;
  createdDateFormatted: string;
  completedDateFormatted: string;
  summaryMetrics: BatchSummaryMetrics;
  rows: BatchRowItemViewModel[];
  reconciliationItems: BatchRowItemViewModel[];
  canExecuteBatch: boolean;
  isBatchCompleted: boolean;
  hasData: boolean;
}
