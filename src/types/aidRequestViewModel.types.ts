import { FieldRenderState } from './personViewModel.types';
import { AidRequestStatus, AidRequestUrgency, AidRequestApprovalItem } from './aidRequest.types';

export interface AidRequestHeaderViewModel {
  id_ajuan: string;
  identity: {
    jenis_bantuan: string;
    urgensi: AidRequestUrgency | string;
  };
  ownership: {
    id_pos: string;
    nama_organisasi: string;
    org_level: string;
  };
  workflow: {
    status: AidRequestStatus;
    created_at: string;
  };
}

export interface AidRequestOverviewViewModel {
  jenisBantuan: FieldRenderState<string>;
  urgensi: FieldRenderState<string>;
  namaOrganisasi: FieldRenderState<string>;
  orgLevel: FieldRenderState<string>;
  statusWorkflow: FieldRenderState<AidRequestStatus>;
  tglPengajuan: FieldRenderState<string>;
}

export interface AidRequestProposalViewModel {
  biaya: FieldRenderState<number>;
  keterangan: FieldRenderState<string>;
  idTanah: FieldRenderState<string>;
  idBangunan: FieldRenderState<string>;
  idAsetB: FieldRenderState<string>;
}

export interface AidRequestApprovalHistoryViewModel {
  items: FieldRenderState<AidRequestApprovalItem[]>;
}

export interface AidRequestWorkspaceViewModel {
  id_ajuan: string;
  header: AidRequestHeaderViewModel;
  overview: AidRequestOverviewViewModel;
  proposal: AidRequestProposalViewModel;
  approvalHistory: AidRequestApprovalHistoryViewModel;
}
