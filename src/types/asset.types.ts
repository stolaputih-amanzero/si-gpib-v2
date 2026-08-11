import { PrivacyState } from './person.types';

export type AssetCategory = 'tanah' | 'bangunan' | 'bergerak';

export interface AssetIdentityNode {
  id_asset: string;
  kategori: AssetCategory;
  nama_aset: string;
}

export interface AssetOwnershipNode {
  id_pos: string;
  nama_organisasi: string;
  org_level: string;
}

export interface AssetPhysicalNode {
  luas_m2: number | null;
  fungsi: string | null;
  nama_bangunan: string | null;
  jenis: string | null;
  merk_tipe: string | null;
  thn_perolehan: number | null;
  thn_berdiri: number | null;
  kondisi: string | null;
}

export interface AssetLocationNode {
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface AssetValuationNode {
  nilai_est: number | null;
  nilai_buku: number | null;
  sumber_dana: string | null;
}

export interface AssetAttachmentItem {
  id_lampiran: string;
  nama_file: string;
  url: string;
  file_type: string;
}

export interface AssetLegalNode {
  status_hukum: string | null;
  no_sertifikat: string | null;
  lampiran_files: AssetAttachmentItem[];
}

export interface AssetContextNode {
  requester_access_level: 'FULL_ADMIN' | 'RESTRICTED' | 'STANDARD' | 'UNAUTHENTICATED';
  is_same_ancestral_tree: boolean;
}

export interface AssetPrivacyMap {
  identity: PrivacyState;
  ownership: PrivacyState;
  physical: PrivacyState;
  location: PrivacyState;
  valuation: PrivacyState;
  legal: PrivacyState;
}

export interface UnifiedAssetData {
  id_asset: string;
  identity: AssetIdentityNode;
  ownership: AssetOwnershipNode;
  physical: AssetPhysicalNode;
  location: AssetLocationNode;
  valuation: AssetValuationNode | null;
  legal: AssetLegalNode | null;
  context: AssetContextNode;
  _meta: {
    privacy: AssetPrivacyMap;
  };
}
