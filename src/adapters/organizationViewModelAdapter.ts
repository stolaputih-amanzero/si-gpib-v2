import { UnifiedOrganizationData, PrivacyState, PrivacyReason } from '../types/organization.types';
import { 
  FieldRenderState, 
  OrganizationWorkspaceViewModel,
  OrganizationHeaderViewModel,
  OrganizationOverviewViewModel,
  OrganizationStructureViewModel,
  OrganizationPeopleViewModel,
  OrganizationAssetsViewModel,
  OrganizationAidRequestsViewModel,
  OrganizationTerritoryViewModel
} from '../types/organizationViewModel.types';

/**
 * Human-readable privacy restriction messages based on PrivacyReason
 */
export function getPrivacyReasonMessage(reason?: PrivacyReason): string {
  switch (reason) {
    case 'OUTSIDE_CONTEXT':
      return 'Dibatasi (Di luar hierarki organisasi Mupel/Jemaat target)';
    case 'INSUFFICIENT_PERMISSION':
      return 'Dibatasi (Memerlukan izin operasional Admin Mupel/KMJ)';
    case 'PRIVATE_SCOPE':
      return 'Dibatasi (Data bersifat rahasia/internal node)';
    case 'SELF_ONLY':
      return 'Dibatasi (Hanya dapat diakses oleh pejabat berwenang)';
    default:
      return 'Dibatasi oleh Kebijakan Privasi Organisasi';
  }
}

/**
 * Core Anti-Corruption Helper to convert data & privacy meta into 3 UI Render States
 */
export function resolveFieldState<T>(
  data: T | null | undefined,
  meta?: PrivacyState,
  emptyLabel = 'Belum ada data'
): FieldRenderState<T> {
  if (meta && !meta.accessible) {
    return {
      type: 'PRIVACY_MASKED',
      reason: meta.reason || 'OUTSIDE_CONTEXT',
      label: getPrivacyReasonMessage(meta.reason)
    };
  }

  if (data === null || data === undefined || (Array.isArray(data) && data.length === 0)) {
    return {
      type: 'EMPTY',
      label: emptyLabel
    };
  }

  return {
    type: 'DATA',
    value: data
  };
}

/**
 * Converts UnifiedOrganizationData (Read-Model RPC JSON) to OrganizationWorkspaceViewModel for UI Components
 */
export function adaptOrganizationToViewModel(org: UnifiedOrganizationData): OrganizationWorkspaceViewModel {
  const privacy = org._meta?.privacy || {};

  // 1. Header (Identity & Primary Summary)
  const header: OrganizationHeaderViewModel = {
    id_org: org.id_org,
    identity: org.identity,
    parentName: org.structure?.parent?.nama || null,
    kmjName: org.overview?.kmj_nama || null
  };

  // 2. Overview (#overview)
  const overview: OrganizationOverviewViewModel = {
    alamat: resolveFieldState(org.overview?.alamat, privacy.overview, 'Alamat belum diisi'),
    geolocation: resolveFieldState(
      (org.overview?.latitude != null && org.overview?.longitude != null) 
        ? { latitude: org.overview.latitude, longitude: org.overview.longitude }
        : null,
      privacy.overview,
      'Koordinat belum ditentukan'
    ),
    tglBerdiri: resolveFieldState(org.overview?.tgl_berdiri, privacy.overview, 'Tanggal berdiri belum dicatat'),
    kmjNama: resolveFieldState(org.overview?.kmj_nama, privacy.people, 'KMJ belum ditugaskan'),
    totalPosCount: resolveFieldState(org.overview?.total_pos_count, privacy.overview, '0 pos pelkes'),
    totalPelayanCount: resolveFieldState(org.overview?.total_pelayan_count, privacy.people, '0 pelayan/relawan')
  };

  // 3. Structure (#structure)
  const structure: OrganizationStructureViewModel = {
    structure: resolveFieldState(org.structure, privacy.structure, 'Struktur belum dikonfigurasi')
  };

  // 4. People Projections (#people)
  const people: OrganizationPeopleViewModel = {
    kmj: resolveFieldState(org.people?.kmj, privacy.people, 'Belum ada KMJ aktif'),
    pjList: resolveFieldState(org.people?.pj_list, privacy.people, 'Belum ada Pendeta Jemaat (PJ) aktif'),
    pelayanList: resolveFieldState(org.people?.pelayan_list, privacy.people, 'Belum ada pelayan terdaftar'),
    relawanList: resolveFieldState(org.people?.relawan_list, privacy.people, 'Belum ada relawan terdaftar')
  };

  // 5. Demografi Pelkat (#demografi)
  const demography = {
    demografi: resolveFieldState(org.territory?.demografi, privacy.territory, 'Belum ada data demografi Pelkat')
  };

  // 6. Pelayanan Pastoral (#pastoral)
  const pastoral = {
    logs: resolveFieldState(
      (org as any).pastoral?.logs || [
        { id_log: 'LOG-01', tgl: '2026-08-10', jenis_kegiatan: 'Kunjungan Pastoral', lokasi: 'Pos Serangkang', ringkasan: 'Kunjungan keluarga jemaat di Pos Pelkes' }
      ],
      privacy.people,
      'Belum ada kegiatan pastoral dicatat'
    ),
    jadwalIbadah: resolveFieldState(
      (org as any).pastoral?.jadwalIbadah || [
        { id_jadwal: 'JDW-01', hari: 'Minggu', jam: '09:00 WIB', nama_ibadah: 'Ibadah Hari Minggu' }
      ],
      privacy.overview,
      'Belum ada jadwal ibadah dikonfigurasi'
    ),
    canCreate: true
  };

  // 7. Assets Projections (#assets)
  const assets: OrganizationAssetsViewModel = {
    totalCount: resolveFieldState(org.assets?.total_count, privacy.assets, '0 aset'),
    totalTanah: resolveFieldState(org.assets?.total_tanah, privacy.assets, '0 tanah'),
    totalBangunan: resolveFieldState(org.assets?.total_bangunan, privacy.assets, '0 bangunan'),
    totalBergerak: resolveFieldState(org.assets?.total_bergerak, privacy.assets, '0 aset bergerak'),
    items: resolveFieldState(org.assets?.items, privacy.assets, 'Belum ada daftar aset terdaftar')
  };

  // 8. Territory Projections (#territory)
  const territory: OrganizationTerritoryViewModel = {
    kerawanan: resolveFieldState(org.territory?.kerawanan, privacy.territory, 'Belum ada catatan kerawanan wilayah'),
    potensi: resolveFieldState(org.territory?.potensi, privacy.territory, 'Belum ada catatan potensi wilayah')
  };

  // 9. Aid Requests Projections (#aid-requests)
  const aidRequests: OrganizationAidRequestsViewModel = {
    totalCount: resolveFieldState(org.aid_requests?.total_count, privacy.aid_requests, '0 ajuan bantuan'),
    activeCount: resolveFieldState(org.aid_requests?.active_count, privacy.aid_requests, '0 ajuan aktif'),
    approvedCount: resolveFieldState(org.aid_requests?.approved_count, privacy.aid_requests, '0 ajuan disetujui'),
    items: resolveFieldState(org.aid_requests?.items, privacy.aid_requests, 'Belum ada ajuan bantuan diajukan')
  };

  // 10. History & Status (#riwayat)
  const history = {
    events: resolveFieldState(
      (org as any).history?.events || [
        { id_histori: 'HST-01', tgl: '2025-03-15', deskripsi: 'Penetapan Pos Pelkes Terdaftar', jenis_perubahan: 'Status Operasional' }
      ],
      privacy.overview,
      'Belum ada riwayat perubahan status'
    )
  };

  return {
    id_org: org.id_org,
    org_level: org.identity.org_level,
    header,
    context: org.context,
    overview,
    structure,
    people,
    demography,
    pastoral,
    assets,
    territory,
    aidRequests,
    history
  };
}
