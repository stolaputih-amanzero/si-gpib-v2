'use client';

import React, { useState } from 'react';
import { UnifiedPastoralTransferData } from '@/types/pastoralTransfer.types';
import { adaptPastoralTransferToViewModel } from '@/adapters/pastoralTransferViewModelAdapter';
import { PastoralTransferWorkspaceViewModel } from '@/types/pastoralTransferViewModel.types';
import { TransferHeader } from './TransferHeader';
import { TransferLifecycleProgress } from './TransferLifecycleProgress';
import { TransferSummaryCard } from './TransferSummaryCard';
import { AssignmentHistoryTimeline } from './AssignmentHistoryTimeline';
import { ProposalTransferModal } from './ProposalTransferModal';

interface TransferWorkspaceShellProps {
  initialData?: UnifiedPastoralTransferData;
}

const DEFAULT_DATA: UnifiedPastoralTransferData = {
  id_mutasi: 'MUTASI-001',
  transfer: {
    id_mutasi: 'MUTASI-001',
    id_person: 'PERSON-PDT-001',
    nama_lengkap: 'Pdt. Abraham Lincoln, M.Th.',
    id_org_asal: 'ORG-GPIB-JAKARTA',
    nama_org_asal: 'GPIB Paulus Jakarta',
    id_org_tujuan: 'ORG-GPIB-SURABAYA',
    nama_org_tujuan: 'GPIB Immanuel Surabaya',
    status_mutasi: 'PROPOSED',
    tanggal_efektif: '2026-09-01',
    catatan: 'Usulan Mutasi Pelayanan Periodik Sinode',
    created_at: new Date().toISOString()
  },
  current_assignment: {
    id_penugasan: 'NUGAS-001',
    id_person: 'PERSON-PDT-001',
    id_pos: 'ORG-GPIB-JAKARTA',
    nama_organisasi: 'GPIB Paulus Jakarta',
    jabatan: 'Ketua Majelis Jemaat',
    tanggal_mulai: '2020-01-01',
    tanggal_selesai: null,
    status_penugasan: 'ACTIVE'
  },
  assignment_history: [
    {
      id_penugasan: 'NUGAS-001',
      id_person: 'PERSON-PDT-001',
      id_pos: 'ORG-GPIB-JAKARTA',
      nama_organisasi: 'GPIB Paulus Jakarta',
      jabatan: 'Ketua Majelis Jemaat',
      tanggal_mulai: '2020-01-01',
      tanggal_selesai: null,
      status_penugasan: 'ACTIVE'
    },
    {
      id_penugasan: 'NUGAS-000',
      id_person: 'PERSON-PDT-001',
      id_pos: 'ORG-GPIB-MEDAN',
      nama_organisasi: 'GPIB Immanuel Medan',
      jabatan: 'Pendeta Jemaat',
      tanggal_mulai: '2015-01-01',
      tanggal_selesai: '2019-12-31',
      status_penugasan: 'TRANSFERRED'
    }
  ]
};

export const TransferWorkspaceShell: React.FC<TransferWorkspaceShellProps> = ({
  initialData = DEFAULT_DATA
}) => {
  const [data, setData] = useState<UnifiedPastoralTransferData>(initialData);
  const [isProposalOpen, setIsProposalOpen] = useState(false);

  const vm: PastoralTransferWorkspaceViewModel = adaptPastoralTransferToViewModel(data);

  const handleApprove = async (_idMutasi: string): Promise<void> => {
    // Simulate RPC transition_pastoral_transfer_atomic action='approve'
    setData(prev => ({
      ...prev,
      transfer: {
        ...prev.transfer,
        status_mutasi: 'APPROVED_SINODE'
      }
    }));
  };

  const handleDeploy = async (_idMutasi: string): Promise<void> => {
    // Simulate RPC transition_pastoral_transfer_atomic action='deploy'
    // Single Active Assignment & Historical Continuity atomic mutation
    const newAssignmentId = 'NUGAS-' + Math.random().toString(36).substring(2, 8);

    setData(prev => {
      const archived = prev.assignment_history.map(a => 
        a.status_penugasan === 'ACTIVE'
          ? { ...a, status_penugasan: 'TRANSFERRED' as const, tanggal_selesai: new Date().toISOString().split('T')[0] }
          : a
      );
      const newActive = {
        id_penugasan: newAssignmentId,
        id_person: prev.transfer.id_person,
        id_pos: prev.transfer.id_org_tujuan,
        nama_organisasi: prev.transfer.nama_org_tujuan,
        jabatan: 'Ketua Majelis Jemaat',
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: null,
        status_penugasan: 'ACTIVE' as const
      };

      return {
        ...prev,
        transfer: {
          ...prev.transfer,
          status_mutasi: 'DEPLOYED'
        },
        current_assignment: newActive,
        assignment_history: [newActive, ...archived]
      };
    });
  };

  const handleSubmitProposal = async (
    idPerson: string,
    namaLengkap: string,
    idOrgAsal: string,
    namaOrgAsal: string,
    idOrgTujuan: string,
    namaOrgTujuan: string,
    catatan: string
  ): Promise<void> => {
    // Simulate Proposal Insert
    const newMutasiId = 'MUTASI-' + Math.random().toString(36).substring(2, 8);
    setData(prev => ({
      ...prev,
      id_mutasi: newMutasiId,
      transfer: {
        id_mutasi: newMutasiId,
        id_person: idPerson,
        nama_lengkap: namaLengkap,
        id_org_asal: idOrgAsal,
        nama_org_asal: namaOrgAsal,
        id_org_tujuan: idOrgTujuan,
        nama_org_tujuan: namaOrgTujuan,
        status_mutasi: 'PROPOSED',
        tanggal_efektif: '2026-09-01',
        catatan: catatan,
        created_at: new Date().toISOString()
      }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        <TransferHeader vm={vm} onOpenProposalModal={() => setIsProposalOpen(true)} />
        <TransferLifecycleProgress transfer={vm.transfer} onApprove={handleApprove} onDeploy={handleDeploy} />
        <TransferSummaryCard vm={vm} />
        <AssignmentHistoryTimeline assignments={vm.assignmentHistory} />
      </div>

      <ProposalTransferModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        onSubmitProposal={handleSubmitProposal}
      />
    </div>
  );
};
