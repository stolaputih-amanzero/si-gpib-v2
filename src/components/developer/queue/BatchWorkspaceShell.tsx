'use client';

import React, { useState } from 'react';
import { UnifiedBatchData, BatchAtomicityPolicy } from '@/types/batchProcessing.types';
import { adaptBatchProcessingToViewModel } from '@/adapters/batchProcessingViewModelAdapter';
import { BatchHeader } from './BatchHeader';
import { BatchProgressStepper } from './BatchProgressStepper';
import { BatchSummaryCard } from './BatchSummaryCard';
import { StagingDataGridPanel } from './StagingDataGridPanel';
import { BatchUploadModal } from './BatchUploadModal';

interface BatchWorkspaceShellProps {
  initialBatchData?: UnifiedBatchData | null;
}

export const BatchWorkspaceShell: React.FC<BatchWorkspaceShellProps> = ({
  initialBatchData
}) => {
  const [batchData, setBatchData] = useState<UnifiedBatchData | null>(initialBatchData || null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Client-side demo fallback if no RPC data loaded yet
  const activeBatchData: UnifiedBatchData = batchData || {
    header: {
      id_batch: 'BATCH-DEMO-001',
      target_entity_type: 'person',
      atomicity_policy: 'ALL_OR_NOTHING',
      lifecycle_status: 'UPLOADED',
      total_rows: 3,
      valid_rows: 0,
      invalid_rows: 0,
      committed_rows: 0,
      failed_rows: 0,
      created_at: new Date().toISOString(),
      completed_at: null
    },
    staging_rows: [
      {
        id_staging: 'STG-DEMO-1',
        batch_id: 'BATCH-DEMO-001',
        row_number: 1,
        row_status: 'STAGED',
        payload: { nama_lengkap: 'Budi Santoso', no_anggota: 'JMT-001' },
        error_code: null,
        error_message: null,
        reconciliation_notes: null,
        created_at: new Date().toISOString()
      },
      {
        id_staging: 'STG-DEMO-2',
        batch_id: 'BATCH-DEMO-001',
        row_number: 2,
        row_status: 'STAGED',
        payload: { nama_lengkap: 'Siti Rahma', no_anggota: 'JMT-002' },
        error_code: null,
        error_message: null,
        reconciliation_notes: null,
        created_at: new Date().toISOString()
      },
      {
        id_staging: 'STG-DEMO-3',
        batch_id: 'BATCH-DEMO-001',
        row_number: 3,
        row_status: 'STAGED',
        payload: { nama_lengkap: '', no_anggota: 'JMT-003' },
        error_code: null,
        error_message: null,
        reconciliation_notes: null,
        created_at: new Date().toISOString()
      }
    ],
    chunk_config: { chunkSize: 100, continueOnError: false },
    validation_summary: {
      batch_id: 'BATCH-DEMO-001',
      total_evaluated: 3,
      valid_count: 0,
      invalid_count: 0,
      can_execute: false,
      validation_errors: []
    }
  };

  const vm = adaptBatchProcessingToViewModel(activeBatchData);

  const handleUploadSubmit = async (
    targetEntity: string,
    policy: BatchAtomicityPolicy,
    rawPayload: any[]
  ) => {
    // Simulate create_batch_staging_atomic RPC
    const newBatch: UnifiedBatchData = {
      header: {
        id_batch: 'BATCH-' + Math.random().toString(36).substring(2, 8),
        target_entity_type: targetEntity,
        atomicity_policy: policy,
        lifecycle_status: 'UPLOADED',
        total_rows: rawPayload.length,
        valid_rows: 0,
        invalid_rows: 0,
        committed_rows: 0,
        failed_rows: 0,
        created_at: new Date().toISOString(),
        completed_at: null
      },
      staging_rows: rawPayload.map((p, idx) => ({
        id_staging: `STG-${idx + 1}`,
        batch_id: 'BATCH-NEW',
        row_number: idx + 1,
        row_status: 'STAGED',
        payload: p,
        error_code: null,
        error_message: null,
        reconciliation_notes: null,
        created_at: new Date().toISOString()
      })),
      chunk_config: { chunkSize: 100, continueOnError: policy === 'PARTIAL_ALLOW_VALID' },
      validation_summary: {
        batch_id: 'BATCH-NEW',
        total_evaluated: rawPayload.length,
        valid_count: 0,
        invalid_count: 0,
        can_execute: false,
        validation_errors: []
      }
    };
    setBatchData(newBatch);
  };

  const handleRunDryRun = async () => {
    if (!batchData) return;
    let valid = 0;
    let invalid = 0;

    const updatedRows = batchData.staging_rows.map((r) => {
      if (!r.payload.nama_lengkap || r.payload.nama_lengkap.trim() === '') {
        invalid++;
        return {
          ...r,
          row_status: 'INVALID' as const,
          error_code: 'MISSING_REQUIRED_FIELD',
          error_message: 'Field nama_lengkap wajib diisi.',
          reconciliation_notes: 'Lengkapi nama jemaat'
        };
      } else {
        valid++;
        return {
          ...r,
          row_status: 'VALID' as const,
          error_code: null,
          error_message: null
        };
      }
    });

    setBatchData({
      ...batchData,
      header: {
        ...batchData.header,
        lifecycle_status: 'VALIDATED',
        valid_rows: valid,
        invalid_rows: invalid
      },
      staging_rows: updatedRows,
      validation_summary: {
        ...batchData.validation_summary,
        valid_count: valid,
        invalid_count: invalid,
        can_execute: invalid === 0 || batchData.header.atomicity_policy === 'PARTIAL_ALLOW_VALID'
      }
    });
  };

  const handleExecuteChunk = async () => {
    if (!batchData) return;
    let committed = 0;
    let failed = 0;

    const updatedRows = batchData.staging_rows.map((r) => {
      if (r.row_status === 'VALID') {
        committed++;
        return { ...r, row_status: 'COMMITTED' as const };
      }
      return r;
    });

    setBatchData({
      ...batchData,
      header: {
        ...batchData.header,
        lifecycle_status: 'COMPLETED',
        committed_rows: batchData.header.committed_rows + committed,
        failed_rows: batchData.header.failed_rows + failed,
        completed_at: new Date().toISOString()
      },
      staging_rows: updatedRows
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <BatchHeader vm={vm} onOpenUploadModal={() => setIsUploadModalOpen(true)} />
      <BatchProgressStepper
        vm={vm}
        onRunDryRun={handleRunDryRun}
        onExecuteChunk={handleExecuteChunk}
      />
      <BatchSummaryCard vm={vm} />
      <StagingDataGridPanel rows={vm.rows} reconciliationItems={vm.reconciliationItems} />

      <BatchUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmitUpload={handleUploadSubmit}
      />
    </div>
  );
};
