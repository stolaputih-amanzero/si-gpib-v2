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
 * Section 4: Assets Projections (#assets)
 */
export interface OrganizationAssetsViewModel {
  totalCount: FieldRenderState<number>;
  totalTanah: FieldRenderState<number>;
  totalBangunan: FieldRenderState<number>;
  totalBergerak: FieldRenderState<number>;
  items: FieldRenderState<OrganizationAssetItemProjection[]>;
}

/**
 * Section 5: Aid Requests Projections (#aid-requests)
 */
export interface OrganizationAidRequestsViewModel {
  totalCount: FieldRenderState<number>;
  activeCount: FieldRenderState<number>;
  approvedCount: FieldRenderState<number>;
  items: FieldRenderState<OrganizationAidRequestItemProjection[]>;
}

/**
 * Section 6: Territory Projections (#territory)
 */
export interface OrganizationTerritoryViewModel {
  demografi: FieldRenderState<OrganizationDemografiItem[]>;
  kerawanan: FieldRenderState<OrganizationKerawananItem[]>;
  potensi: FieldRenderState<OrganizationPotensiItem[]>;
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
  assets: OrganizationAssetsViewModel;
  aidRequests: OrganizationAidRequestsViewModel;
  territory: OrganizationTerritoryViewModel;
}
