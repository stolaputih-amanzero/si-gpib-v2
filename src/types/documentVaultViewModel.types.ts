import { DocumentVisibilityTier, DocumentLifecycleStatus, DocumentEntityType } from './documentVault.types';

export interface DocumentItemViewModel {
  id_dokumen: string;
  entity_type: DocumentEntityType;
  entity_id: string;
  nama_file: string;
  storage_path: string;
  size_bytes: number;
  sizeFormatted: string;
  mime_type: string;
  mimeBadgeLabel: string;
  visibility_tier: DocumentVisibilityTier;
  visibilityLabel: string;
  visibilityBadgeColor: string;
  sha256_checksum: string | null;
  status: DocumentLifecycleStatus;
  statusLabel: string;
  statusBadgeColor: string;
  createdAtFormatted: string;
}

export interface DocumentVaultSummaryViewModel {
  entity_type: DocumentEntityType;
  entity_id: string;
  totalCount: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  activeCount: number;
  pendingCount: number;
  corruptedCount: number;
}

export interface DocumentVaultWorkspaceViewModel {
  summary: DocumentVaultSummaryViewModel;
  documents: DocumentItemViewModel[];
}
