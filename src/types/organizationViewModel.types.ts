import { 
  PrivacyReason,
  OrganizationLevel,
  OrganizationIdentityNode,
  OrganizationStructureNode,
  OrganizationContextNode,
  OrganizationPersonProjection,
  OrganizationAssetItemProjection,
  OrganizationAidRequestItemProjection,
  OrganizationDemografiItem,
  OrganizationKerawananItem,
  OrganizationPotensiItem
} from './organization.types';

/**
 * 3 Discriminated UI Render States
 */
export type FieldRenderState<T> = 
  | { type: 'DATA'; value: T }
  | { type: 'EMPTY'; label: string }
  | { type: 'PRIVACY_MASKED'; reason: PrivacyReason; label: string };

/**
 * Organization Header ViewModel ("Apa organisasi ini?")
 */
export interface OrganizationHeaderViewModel {
  id_org: string;
  identity: OrganizationIdentityNode;
  parentName: string | null;
  kmjName: string | null;
}

/**
 * Section 1: Overview (#overview)
 */
export interface OrganizationOverviewViewModel {
  alamat: FieldRenderState<string>;
  geolocation: FieldRenderState<{ latitude: number; longitude: number }>;
  tglBerdiri: FieldRenderState<string>;
  kmjNama: FieldRenderState<string>;
  totalPosCount: FieldRenderState<number>;
  totalPelayanCount: FieldRenderState<number>;
}

/**
 * Section 2: Structure (#structure)
 */
export interface OrganizationStructureViewModel {
  structure: FieldRenderState<OrganizationStructureNode>;
}

/**
 * Section 3: People Projections (#people)
 */
export interface OrganizationPeopleViewModel {
  kmj: FieldRenderState<OrganizationPersonProjection | null>;
  pjList: FieldRenderState<OrganizationPersonProjection[]>;
  pelayanList: FieldRenderState<OrganizationPersonProjection[]>;
  relawanList: FieldRenderState<OrganizationPersonProjection[]>;
}

/**
 * Section 4: Demography (#demografi)
 */
export interface OrganizationDemographyViewModel {
  demografi: FieldRenderState<OrganizationDemografiItem[]>;
}

/**
 * Section 5: Pastoral (#pastoral)
 */
export interface OrganizationPastoralLogItem {
  id_log: string;
  tgl: string;
  jenis_kegiatan: string;
  lokasi?: string;
  ringkasan: string;
}

export interface OrganizationWorshipScheduleItem {
  id_jadwal: string;
  hari: string;
  jam: string;
  nama_ibadah: string;
}

export interface OrganizationPastoralViewModel {
  logs: FieldRenderState<OrganizationPastoralLogItem[]>;
  jadwalIbadah: FieldRenderState<OrganizationWorshipScheduleItem[]>;
  canCreate: boolean;
}

/**
 * Section 6: Assets Projections (#assets)
 */
export interface OrganizationAssetsViewModel {
  totalCount: FieldRenderState<number>;
  totalTanah: FieldRenderState<number>;
  totalBangunan: FieldRenderState<number>;
  totalBergerak: FieldRenderState<number>;
  items: FieldRenderState<OrganizationAssetItemProjection[]>;
}

/**
 * Section 7: Territory Projections (#territory)
 */
export interface OrganizationTerritoryViewModel {
  kerawanan: FieldRenderState<OrganizationKerawananItem[]>;
  potensi: FieldRenderState<OrganizationPotensiItem[]>;
}

/**
 * Section 8: Aid Requests Projections (#aid-requests)
 */
export interface OrganizationAidRequestsViewModel {
  totalCount: FieldRenderState<number>;
  activeCount: FieldRenderState<number>;
  approvedCount: FieldRenderState<number>;
  items: FieldRenderState<OrganizationAidRequestItemProjection[]>;
}

/**
 * Section 9: History & Status (#riwayat)
 */
export interface OrganizationHistoryEventItem {
  id_histori: string;
  tgl: string;
  deskripsi: string;
  jenis_perubahan: string;
}

export interface OrganizationHistoryViewModel {
  events: FieldRenderState<OrganizationHistoryEventItem[]>;
}

/**
 * Combined Organization Workspace ViewModel
 */
export interface OrganizationWorkspaceViewModel {
  id_org: string;
  org_level: OrganizationLevel;
  header: OrganizationHeaderViewModel;
  context: OrganizationContextNode;
  overview: OrganizationOverviewViewModel;
  structure: OrganizationStructureViewModel;
  people: OrganizationPeopleViewModel;
  demography: OrganizationDemographyViewModel;
  pastoral: OrganizationPastoralViewModel;
  assets: OrganizationAssetsViewModel;
  territory: OrganizationTerritoryViewModel;
  aidRequests: OrganizationAidRequestsViewModel;
  history: OrganizationHistoryViewModel;
}
