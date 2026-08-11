'use client';

import React, { useState } from 'react';
import { UnifiedDocumentVaultData, DocumentVisibilityTier, DocumentEntityType } from '@/types/documentVault.types';
import { adaptDocumentVaultToViewModel } from '@/adapters/documentVaultViewModelAdapter';
import { DocumentVaultWorkspaceViewModel } from '@/types/documentVaultViewModel.types';
import { DocumentVaultHeader } from './DocumentVaultHeader';
import { DocumentVaultSummaryCard } from './DocumentVaultSummaryCard';
import { DocumentItemCard } from './DocumentItemCard';
import { DocumentUploadModal } from './DocumentUploadModal';
import { FileText } from 'lucide-react';

interface DocumentVaultWorkspaceShellProps {
  initialData?: UnifiedDocumentVaultData;
}

const DEFAULT_DATA: UnifiedDocumentVaultData = {
  entity_type: 'aid_request',
  entity_id: 'AJUAN-TEST-001',
  total_count: 2,
  total_size_bytes: 2621440,
  documents: [
    {
      id_dokumen: 'DOC-001',
      entity_type: 'aid_request',
      entity_id: 'AJUAN-TEST-001',
      nama_file: 'proposal_bantuan_pos_pelkes.pdf',
      storage_path: 'aid_request/AJUAN-TEST-001/DOC-001/proposal_bantuan_pos_pelkes.pdf',
      size_bytes: 2097152,
      mime_type: 'application/pdf',
      visibility_tier: 'ORG_WIDE',
      sha256_checksum: 'SHA256-HASH-001',
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    },
    {
      id_dokumen: 'DOC-002',
      entity_type: 'aid_request',
      entity_id: 'AJUAN-TEST-001',
      nama_file: 'kuitansi_pembelian_material.pdf',
      storage_path: 'aid_request/AJUAN-TEST-001/DOC-002/kuitansi_pembelian_material.pdf',
      size_bytes: 524288,
      mime_type: 'application/pdf',
      visibility_tier: 'CONFIDENTIAL',
      sha256_checksum: 'SHA256-HASH-002',
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    }
  ]
};

export const DocumentVaultWorkspaceShell: React.FC<DocumentVaultWorkspaceShellProps> = ({
  initialData = DEFAULT_DATA
}) => {
  const [data, setData] = useState<UnifiedDocumentVaultData>(initialData);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const vm: DocumentVaultWorkspaceViewModel = adaptDocumentVaultToViewModel(data);

  const handleGetSignedUrl = async (idDokumen: string): Promise<string | null> => {
    const doc = data.documents.find(d => d.id_dokumen === idDokumen);
    if (!doc) return null;

    // Simulate RPC get_document_signed_url
    return `https://mock-storage.supabase.co/object/sign/vault_documents/${doc.storage_path}?token=MOCK_TOKEN_60S`;
  };

  const handleSoftDelete = async (idDokumen: string): Promise<void> => {
    // Simulate RPC delete_document_soft
    setData(prev => ({
      ...prev,
      documents: prev.documents.map(d => 
        d.id_dokumen === idDokumen ? { ...d, status: 'DELETED' } : d
      )
    }));
  };

  const handleUpload = async (
    entityType: DocumentEntityType,
    entityId: string,
    fileName: string,
    sizeBytes: number,
    mimeType: string,
    visibilityTier: DocumentVisibilityTier
  ): Promise<void> => {
    // Simulate Two-Phase Protocol (Intent -> Binary -> Confirm)
    const newDocId = 'DOC-' + Math.random().toString(36).substring(2, 8);
    const newDoc = {
      id_dokumen: newDocId,
      entity_type: entityType,
      entity_id: entityId,
      nama_file: fileName,
      storage_path: `${entityType}/${entityId}/${newDocId}/${fileName}`,
      size_bytes: sizeBytes,
      mime_type: mimeType,
      visibility_tier: visibilityTier,
      sha256_checksum: 'SHA256-CONFIRMED',
      status: 'ACTIVE' as const,
      created_at: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      total_count: prev.total_count + 1,
      total_size_bytes: prev.total_size_bytes + sizeBytes,
      documents: [newDoc, ...prev.documents]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        <DocumentVaultHeader summary={vm.summary} onOpenUploadModal={() => setIsUploadOpen(true)} />
        <DocumentVaultSummaryCard summary={vm.summary} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Daftar Dokumen Lampiran Vault ({vm.documents.length})</h2>
          </div>

          {vm.documents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Belum Ada Dokumen Terlampir</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Gunakan tombol "Unggah Dokumen Baru" untuk melampirkan SK, sertifikat, atau bukti fisik ke entitas ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {vm.documents.map(doc => (
                <DocumentItemCard
                  key={doc.id_dokumen}
                  item={doc}
                  onGetSignedUrl={handleGetSignedUrl}
                  onSoftDelete={handleSoftDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};
