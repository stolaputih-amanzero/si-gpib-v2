/**
 * Organization Workspace - Interface Types (Gate 2 Contract)
 * 
 * Dokumen tipe ini di-generate dari Organization Workspace Contract v0.3.
 * SELALU gunakan tipe dari file ini untuk menerima payload dari RPC `get_organization_360()`.
 * JANGAN PERNAH menambahkan mekanisme otorisasi atau logika UI (e.g. canEdit, showButton) di tipe ini.
 * SYSTEM_ONLY tidak ada di dalam kontrak ini karena secara absolut tidak boleh masuk ke JSONB response.
 */

export type OrganizationLevel = 'MUPEL' | 'JEMAAT_INDUK' | 'POS_PELKES';

export type VisibilityClass = 
  | 'ORG_WIDE' 
  | 'PUBLIC_WITHIN_CONTEXT' 
  | 'RESTRICTED' 
  | 'PRIVATE';

export type PrivacyReason =
  | 'INSUFFICIENT_PERMISSION'
  | 'OUTSIDE_CONTEXT'
  | 'PRIVATE_SCOPE'
  | 'SELF_ONLY';

export interface PrivacyState {
  accessible: boolean; // True jika user memiliki hak akses (data ditampilkan)
  visibility: VisibilityClass; // Level otorisasi intrinsik dari data
  reason?: PrivacyReason; // Terisi jika accessible false (dikunci oleh backend)
}

/**
 * Root Struktur Data Organization Workspace
 */
export interface UnifiedOrganizationData {
  id_org: string;
  identity: OrganizationIdentityNode;
  structure: OrganizationStructureNode;
  context: OrganizationContextNode;
  overview: OrganizationOverviewNode;
  people: OrganizationPeopleNode;
  assets: OrganizationAssetsNode;
  aid_requests: OrganizationAidRequestsNode;
  territory: OrganizationTerritoryNode;
  _meta: {
    privacy: Record<string, PrivacyState>;
  };
}

/**
 * A. Identity Node (ORG_WIDE)
 * Identitas kanonikal node organisasi.
 */
export interface OrganizationIdentityNode {
  id_org: string;
  org_level: OrganizationLevel;
  nama: string;
  keterangan: string | null;
  status: string;
}

/**
 * B. Structure Node (Hierarki & Topologi)
 */
export interface OrganizationRefNode {
  id_org: string;
  nama: string;
  org_level: OrganizationLevel;
  count_sub?: number;
}

export interface OrganizationStructureNode {
  parent: OrganizationRefNode | null;
  children: OrganizationRefNode[];
  ancestors: OrganizationRefNode[];
}

/**
 * C. Context Node (Metadata Hak Pemohon & Scope)
 */
export interface OrganizationContextNode {
  requester_access_level: 'FULL_ADMIN' | 'READ_CONTEXT' | 'PUBLIC_VISITOR';
  is_same_ancestral_tree: boolean;
}

/**
 * D. Overview Node
 */
export interface OrganizationOverviewNode {
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  tgl_berdiri: string | null;
  kmj_nama: string | null;
  total_pos_count: number | null;
  total_pelayan_count: number | null;
}

/**
 * E. People Projections Node (#people)
 * Proyeksi SDM/Pelayan yang bertugas di organisasi ini.
 */
export interface OrganizationPersonProjection {
  id_person: string;
  nama_lengkap: string;
  role_label: string; // e.g., 'KMJ', 'PJ', 'Pendeta', 'Pelayan', 'Relawan'
  status: string;
}

export interface OrganizationPeopleNode {
  kmj: OrganizationPersonProjection | null;
  pj_list: OrganizationPersonProjection[];
  pelayan_list: OrganizationPersonProjection[];
  relawan_list: OrganizationPersonProjection[];
}

/**
 * F. Asset Projections Node (#assets)
 * Ringkasan agregat dan item aset organisasi.
 */
export interface OrganizationAssetItemProjection {
  id_asset: string;
  nama_aset: string;
  kategori: 'tanah' | 'bangunan' | 'bergerak';
  kondisi: string | null;
  detail: string | null;
}

export interface OrganizationAssetsNode {
  total_count: number;
  total_tanah: number;
  total_bangunan: number;
  total_bergerak: number;
  items: OrganizationAssetItemProjection[];
}

/**
 * G. Aid Request Projections Node (#aid-requests)
 * Ringkasan workflow ajuan bantuan organisasi.
 */
export interface OrganizationAidRequestItemProjection {
  id_ajuan: string;
  jenis_bantuan: string;
  biaya: number | null;
  urgensi: string | null;
  status: string;
  created_at: string;
}

export interface OrganizationAidRequestsNode {
  total_count: number;
  active_count: number;
  approved_count: number;
  items: OrganizationAidRequestItemProjection[];
}

/**
 * H. Territory Projections Node (#territory)
 * Data empiris dari t_demografi_pelkat, t_kerawanan_wilayah, t_potensi_wilayah.
 */
export interface OrganizationDemografiItem {
  kategori_pelkat: string;
  jml_kk: number | null;
  laki: number | null;
  perempuan: number | null;
}

export interface OrganizationKerawananItem {
  id_risiko: string;
  kategori: string | null;
  jenis_risiko: string | null;
  frekuensi: string | null;
}

export interface OrganizationPotensiItem {
  id_potensi: string;
  nama_potensi: string | null;
  kategori: string | null;
  deskripsi: string | null;
}

export interface OrganizationTerritoryNode {
  demografi: OrganizationDemografiItem[];
  kerawanan: OrganizationKerawananItem[];
  potensi: OrganizationPotensiItem[];
}
