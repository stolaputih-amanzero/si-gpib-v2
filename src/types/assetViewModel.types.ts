import { FieldRenderState } from './personViewModel.types';
import { 
  AssetIdentityNode, 
  AssetOwnershipNode, 
  AssetAttachmentItem 
} from './asset.types';

export type { FieldRenderState };

export interface AssetHeaderViewModel {
  id_asset: string;
  identity: AssetIdentityNode;
  ownership: AssetOwnershipNode;
}

export interface AssetOverviewViewModel {
  namaAset: FieldRenderState<string>;
  kategori: FieldRenderState<string>;
  namaOrganisasi: FieldRenderState<string>;
  orgLevel: FieldRenderState<string>;
}

export interface AssetPhysicalViewModel {
  luasM2: FieldRenderState<number>;
  fungsi: FieldRenderState<string>;
  namaBangunan: FieldRenderState<string>;
  jenis: FieldRenderState<string>;
  merkTipe: FieldRenderState<string>;
  thnPerolehan: FieldRenderState<number>;
  thnBerdiri: FieldRenderState<number>;
  kondisi: FieldRenderState<string>;
}

export interface AssetLocationViewModel {
  alamat: FieldRenderState<string>;
  geolocation: FieldRenderState<{ latitude: number; longitude: number }>;
}

export interface AssetValuationViewModel {
  nilaiEst: FieldRenderState<number>;
  nilaiBuku: FieldRenderState<number>;
  sumberDana: FieldRenderState<string>;
}

export interface AssetLegalViewModel {
  statusHukum: FieldRenderState<string>;
  noSertifikat: FieldRenderState<string>;
  lampiranFiles: FieldRenderState<AssetAttachmentItem[]>;
}

export interface AssetWorkspaceViewModel {
  id_asset: string;
  header: AssetHeaderViewModel;
  overview: AssetOverviewViewModel;
  physical: AssetPhysicalViewModel;
  location: AssetLocationViewModel;
  valuation: AssetValuationViewModel;
  legal: AssetLegalViewModel;
}
