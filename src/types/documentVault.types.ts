export type DocumentVisibilityTier = 'PUBLIC' | 'ORG_WIDE' | 'CONFIDENTIAL';

export type DocumentLifecycleStatus = 
  | 'PENDING_UPLOAD' 
  | 'ACTIVE' 
  | 'FAILED_UPLOAD' 
  | 'CORRUPTED' 
  | 'DELETED';

export type DocumentEntityType = 'person' | 'organization' | 'asset' | 'aid_request';

export interface DocumentMetadata {
  id_dokumen: string;
  entity_type: DocumentEntityType;
  entity_id: string;
  nama_file: string;
  storage_path: string;
  size_bytes: number;
  mime_type: string;
  visibility_tier: DocumentVisibilityTier;
  sha256_checksum: string | null;
  status: DocumentLifecycleStatus;
  created_at: string;
}

export interface DocumentUploadIntent {
  id_dokumen: string;
  entity_type: DocumentEntityType;
  entity_id: string;
  expected_file_name: string;
  expected_size_bytes: number;
  expected_mime_type: string;
  storage_path: string;
  upload_token: string;
  expires_at: string;
}

export interface DocumentSignedUrlResult {
  id_dokumen: string;
  signed_url: string;
  expires_at: string;
}

export interface UnifiedDocumentVaultData {
  entity_type: DocumentEntityType;
  entity_id: string;
  total_count: number;
  total_size_bytes: number;
  documents: DocumentMetadata[];
}
