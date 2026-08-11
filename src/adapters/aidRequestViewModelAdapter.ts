import { UnifiedAidRequestData } from '@/types/aidRequest.types';
import { AidRequestWorkspaceViewModel } from '@/types/aidRequestViewModel.types';
import { FieldRenderState } from '@/types/personViewModel.types';
import { PrivacyState } from '@/types/person.types';

function resolveFieldState<T>(
  value: T | null | undefined,
  privacyState: PrivacyState | undefined,
  emptyLabel: string = 'Belum ada data',
  maskedLabel: string = 'Informasi Dibatasi'
): FieldRenderState<T> {
  if (!privacyState || !privacyState.accessible) {
    return {
      type: 'PRIVACY_MASKED',
      reason: privacyState?.reason || 'INSUFFICIENT_PERMISSION',
      label: maskedLabel
    };
  }

  if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
    return {
      type: 'EMPTY',
      label: emptyLabel
    };
  }

  return {
    type: 'DATA',
    value
  };
}

export function adaptAidRequestToViewModel(
  data: UnifiedAidRequestData
): AidRequestWorkspaceViewModel {
  const privacy = data._meta.privacy;

  return {
    id_ajuan: data.id_ajuan,

    // Header View Model (Identity-First + Status Badge)
    header: {
      id_ajuan: data.id_ajuan,
      identity: {
        jenis_bantuan: data.identity.jenis_bantuan,
        urgensi: data.identity.urgensi
      },
      ownership: {
        id_pos: data.ownership.id_pos,
        nama_organisasi: data.ownership.nama_organisasi,
        org_level: data.ownership.org_level
      },
      workflow: {
        status: data.workflow.status,
        created_at: data.workflow.created_at
      }
    },

    // Overview Projection
    overview: {
      jenisBantuan: resolveFieldState(data.identity.jenis_bantuan, privacy.identity, 'Jenis bantuan belum diisi', 'Jenis Bantuan Dibatasi'),
      urgensi: resolveFieldState(data.identity.urgensi, privacy.identity, 'Urgensi belum ditentukan', 'Urgensi Dibatasi'),
      namaOrganisasi: resolveFieldState(data.ownership.nama_organisasi, privacy.ownership, 'Organisasi pemohon belum tercatat', 'Organisasi Dibatasi'),
      orgLevel: resolveFieldState(data.ownership.org_level, privacy.ownership, 'Tingkat organisasi belum diisi', 'Tingkat Organisasi Dibatasi'),
      statusWorkflow: resolveFieldState(data.workflow.status, privacy.workflow, 'Status belum ditentukan', 'Status Dibatasi'),
      tglPengajuan: resolveFieldState(data.workflow.created_at, privacy.workflow, 'Tanggal pengajuan belum tercatat', 'Tanggal Pengajuan Dibatasi')
    },

    // Proposal Projection (Restricted Node)
    proposal: {
      biaya: resolveFieldState(
        data.proposal?.biaya ?? null,
        privacy.proposal,
        'Nominal biaya belum diestimasi',
        'Informasi Biaya & RAB Dibatasi'
      ),
      keterangan: resolveFieldState(
        data.proposal?.keterangan ?? null,
        privacy.proposal,
        'Keterangan pengajuan belum diisi',
        'Keterangan Pengajuan Dibatasi'
      ),
      idTanah: resolveFieldState(
        data.proposal?.id_tanah ?? null,
        privacy.proposal,
        'Tidak ada keterkaitan aset tanah',
        'Informasi Aset Terkait Dibatasi'
      ),
      idBangunan: resolveFieldState(
        data.proposal?.id_bangunan ?? null,
        privacy.proposal,
        'Tidak ada keterkaitan aset bangunan',
        'Informasi Aset Terkait Dibatasi'
      ),
      idAsetB: resolveFieldState(
        data.proposal?.id_aset_b ?? null,
        privacy.proposal,
        'Tidak ada keterkaitan aset bergerak',
        'Informasi Aset Terkait Dibatasi'
      )
    },

    // Approval History Projection (Restricted Node)
    approvalHistory: {
      items: resolveFieldState(
        data.approval_history,
        privacy.approval_history,
        'Belum ada riwayat persetujuan tercatat',
        'Riwayat Persetujuan & Catatan Dibatasi'
      )
    }
  };
}
