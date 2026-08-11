import { UnifiedAssetData } from '../types/asset.types';
import { PrivacyState } from '../types/person.types';
import { 
  AssetWorkspaceViewModel, 
  FieldRenderState 
} from '../types/assetViewModel.types';

function resolveFieldState<T>(
  dataValue: T | null | undefined,
  privacyState: PrivacyState | undefined,
  emptyLabel: string = 'Belum ada data',
  maskedLabel: string = 'Dibatasi oleh Kebijakan Privasi'
): FieldRenderState<T> {
  // 1. Privacy Restriction Priority Check
  if (privacyState && privacyState.accessible === false) {
    return {
      type: 'PRIVACY_MASKED',
      reason: privacyState.reason || 'INSUFFICIENT_PERMISSION',
      label: maskedLabel
    };
  }

  // 2. Data Null or Empty Check (ACCESSIBLE + NULL/EMPTY = EMPTY)
  if (dataValue === null || dataValue === undefined) {
    return {
      type: 'EMPTY',
      label: emptyLabel
    };
  }

  if (Array.isArray(dataValue) && dataValue.length === 0) {
    return {
      type: 'EMPTY',
      label: emptyLabel
    };
  }

  // 3. Authorized Data Present
  return {
    type: 'DATA',
    value: dataValue
  };
}

export function adaptAssetToViewModel(data: UnifiedAssetData): AssetWorkspaceViewModel {
  const privacy = data._meta.privacy;

  return {
    id_asset: data.id_asset,

    // Header Projection
    header: {
      id_asset: data.id_asset,
      identity: data.identity,
      ownership: data.ownership
    },

    // Overview Projection
    overview: {
      namaAset: resolveFieldState(data.identity.nama_aset, privacy.identity, 'Nama aset belum diisi', 'Nama Aset Dibatasi'),
      kategori: resolveFieldState(data.identity.kategori, privacy.identity, 'Kategori belum diisi', 'Kategori Aset Dibatasi'),
      namaOrganisasi: resolveFieldState(data.ownership.nama_organisasi, privacy.ownership, 'Organisasi belum terhubung', 'Organisasi Dibatasi'),
      orgLevel: resolveFieldState(data.ownership.org_level, privacy.ownership, 'Level organisasi belum diisi', 'Level Organisasi Dibatasi')
    },

    // Physical Projection
    physical: {
      luasM2: resolveFieldState(data.physical.luas_m2, privacy.physical, 'Luas tanah belum dicatat', 'Luas Tanah Dibatasi'),
      fungsi: resolveFieldState(data.physical.fungsi, privacy.physical, 'Fungsi bangunan belum diisi', 'Fungsi Bangunan Dibatasi'),
      namaBangunan: resolveFieldState(data.physical.nama_bangunan, privacy.physical, 'Nama bangunan belum diisi', 'Nama Bangunan Dibatasi'),
      jenis: resolveFieldState(data.physical.jenis, privacy.physical, 'Jenis aset bergerak belum diisi', 'Jenis Aset Dibatasi'),
      merkTipe: resolveFieldState(data.physical.merk_tipe, privacy.physical, 'Merk/tipe belum diisi', 'Merk/Tipe Dibatasi'),
      thnPerolehan: resolveFieldState(data.physical.thn_perolehan, privacy.physical, 'Tahun perolehan belum dicatat', 'Tahun Perolehan Dibatasi'),
      thnBerdiri: resolveFieldState(data.physical.thn_berdiri, privacy.physical, 'Tahun berdiri belum dicatat', 'Tahun Berdiri Dibatasi'),
      kondisi: resolveFieldState(data.physical.kondisi, privacy.physical, 'Kondisi fisik belum dicatat', 'Kondisi Fisik Dibatasi')
    },

    // Location Projection
    location: {
      alamat: resolveFieldState(data.location.alamat, privacy.location, 'Alamat lokasi belum diisi', 'Alamat Lokasi Dibatasi'),
      geolocation: resolveFieldState(
        (data.location.latitude !== null && data.location.longitude !== null) 
          ? { latitude: data.location.latitude, longitude: data.location.longitude }
          : null,
        privacy.location,
        'Koordinat lokasi belum dicatat',
        'Koordinat Lokasi Dibatasi'
      )
    },

    // Valuation Projection (Restricted)
    valuation: {
      nilaiEst: resolveFieldState(data.valuation?.nilai_est, privacy.valuation, 'Estimasi nilai belum diisi', 'Informasi Nilai Aset Dibatasi'),
      nilaiBuku: resolveFieldState(data.valuation?.nilai_buku, privacy.valuation, 'Nilai buku belum diisi', 'Informasi Nilai Buku Dibatasi'),
      sumberDana: resolveFieldState(data.valuation?.sumber_dana, privacy.valuation, 'Sumber dana belum diisi', 'Informasi Sumber Dana Dibatasi')
    },

    // Legal Projection (Restricted)
    legal: {
      statusHukum: resolveFieldState(data.legal?.status_hukum, privacy.legal, 'Status hukum belum diisi', 'Informasi Status Hukum Dibatasi'),
      noSertifikat: resolveFieldState(data.legal?.no_sertifikat, privacy.legal, 'Nomor sertifikat belum diisi', 'Informasi Sertifikat Dibatasi'),
      lampiranFiles: resolveFieldState(data.legal?.lampiran_files, privacy.legal, 'Belum ada dokumen lampiran', 'Dokumen Lampiran Dibatasi')
    }
  };
}
