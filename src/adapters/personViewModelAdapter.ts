import { UnifiedPersonData, PrivacyState, PrivacyReason } from '../types/person.types';
import { 
  FieldRenderState, 
  PersonWorkspaceViewModel,
  PersonHeaderViewModel,
  OverviewViewModel,
  ProfileViewModel,
  RolesViewModel,
  CompetenciesViewModel,
  PastoralViewModel,
  PastoralLogItemViewModel
} from '../types/personViewModel.types';

/**
 * Human-readable privacy restriction messages based on PrivacyReason
 */
export function getPrivacyReasonMessage(reason?: PrivacyReason): string {
  switch (reason) {
    case 'OUTSIDE_CONTEXT':
      return 'Dibatasi (Di luar organisasi Mupel/Jemaat target)';
    case 'INSUFFICIENT_PERMISSION':
      return 'Dibatasi (Memerlukan izin khusus Admin/KMJ)';
    case 'SELF_ONLY':
      return 'Dibatasi (Hanya dapat diakses pribadi oleh pemilik profil)';
    case 'PRIVATE_SCOPE':
      return 'Dibatasi (Data bersifat rahasia/privat)';
    default:
      return 'Dibatasi oleh Kebijakan Privasi';
  }
}

/**
 * Core Helper untuk mengonversi data & _meta menjadi 3 status UI Render State
 */
export function resolveFieldState<T>(
  data: T | null | undefined,
  meta?: PrivacyState,
  emptyLabel = 'Belum dilengkapi'
): FieldRenderState<T> {
  if (meta && !meta.accessible) {
    return {
      type: 'PRIVACY_MASKED',
      reason: meta.reason || 'INSUFFICIENT_PERMISSION',
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
 * Converts UnifiedPersonData (Read-Model RPC JSON) to PersonWorkspaceViewModel for UI Components
 */
export function adaptPersonToViewModel(person: UnifiedPersonData): PersonWorkspaceViewModel {
  // 1. Header (Identity-first)
  const header: PersonHeaderViewModel = {
    id_person: person.id_person,
    identity: person.identity,
    primaryRoleLabel: person.overview.current_role_label,
    organizationName: person.overview.current_organization_name,
    isActive: person.overview.is_active
  };

  // 2. Overview
  const overview: OverviewViewModel = {
    currentRoleLabel: resolveFieldState(person.overview.current_role_label, undefined, 'Belum ada jabatan'),
    organizationName: resolveFieldState(person.overview.current_organization_name, undefined, 'GPIB'),
    isActive: resolveFieldState(person.overview.is_active, person.overview._meta?.is_active, 'Tidak Aktif'),
    recentPastoralCount: resolveFieldState(person.overview.recent_pastoral_count, person.overview._meta?.recent_pastoral_count, '0 kegiatan'),
    affiliationOrigin: resolveFieldState(person.overview.affiliation_origin, undefined, 'Organik GPIB')
  };

  // 3. Profile
  const profile: ProfileViewModel = {
    tempatLahir: resolveFieldState(person.profile.data?.tempat_lahir, person.profile._meta?.tempat_lahir, 'Belum diisi'),
    tanggalLahir: resolveFieldState(person.profile.data?.tanggal_lahir, person.profile._meta?.tanggal_lahir, 'Belum diisi'),
    noHp: resolveFieldState(person.profile.data?.no_hp, person.profile._meta?.no_hp, 'Belum diisi'),
    email: resolveFieldState(person.profile.data?.email, person.profile._meta?.email, 'Belum diisi'),
    alamatTinggal: resolveFieldState(person.profile.data?.alamat_tinggal, person.profile._meta?.alamat_tinggal, 'Belum diisi'),
    keluarga: resolveFieldState(person.profile.data?.keluarga, person.profile._meta?.keluarga, 'Belum ada data keluarga'),
    kontakDarurat: resolveFieldState(person.profile.data?.kontak_darurat, person.profile._meta?.kontak_darurat, 'Belum ada kontak darurat'),
    biometricDevices: resolveFieldState(person.profile.data?.biometric_devices, person.profile._meta?.biometric_devices, 'Belum ada perangkat terdaftar')
  };

  // 4. Roles
  const roles: RolesViewModel = {
    assignments: resolveFieldState(person.roles.data?.assignments, person.roles._meta?.assignments, 'Belum ada penugasan'),
    mutations: resolveFieldState(person.roles.data?.mutations, person.roles._meta?.mutations, 'Belum ada riwayat mutasi')
  };

  // 5. Competencies
  const competencies: CompetenciesViewModel = {
    skills: resolveFieldState(person.competencies.data?.skills, person.competencies._meta?.skills, 'Belum ada keahlian dicatat'),
    education: resolveFieldState(person.competencies.data?.education, person.competencies._meta?.education, 'Belum ada pendidikan dicatat'),
    certifications: resolveFieldState(person.competencies.data?.certifications, person.competencies._meta?.certifications, 'Belum ada sertifikasi dicatat')
  };

  // 6. Pastoral (Log item metadata is visible while notes privacy is checked per item)
  const rawLogs = person.pastoral.data?.pastoral_logs;
  let pastoralLogsState: FieldRenderState<PastoralLogItemViewModel[]>;

  if (person.pastoral._meta?.pastoral_logs && !person.pastoral._meta.pastoral_logs.accessible) {
    pastoralLogsState = {
      type: 'PRIVACY_MASKED',
      reason: person.pastoral._meta.pastoral_logs.reason || 'INSUFFICIENT_PERMISSION',
      label: getPrivacyReasonMessage(person.pastoral._meta.pastoral_logs.reason)
    };
  } else if (!rawLogs || rawLogs.length === 0) {
    pastoralLogsState = {
      type: 'EMPTY',
      label: 'Belum ada catatan kegiatan pastoral'
    };
  } else {
    const adaptedItems: PastoralLogItemViewModel[] = rawLogs.map(log => ({
      id_log: log.id_log,
      tanggal: log.tanggal,
      tipe_layanan: log.tipe_layanan,
      status: log.status,
      notes: resolveFieldState(log.notes, log._meta?.notes, 'Tidak ada catatan khusus')
    }));

    pastoralLogsState = {
      type: 'DATA',
      value: adaptedItems
    };
  }

  const pastoral: PastoralViewModel = {
    upcomingSchedules: resolveFieldState(person.pastoral.data?.upcoming_schedules, person.pastoral._meta?.upcoming_schedules, 'Belum ada jadwal mendatang'),
    pastoralLogs: pastoralLogsState,
    pagination: person.pastoral.pagination?.pastoral_logs || { limit: 10, offset: 0, has_more: false }
  };

  return {
    id_person: person.id_person,
    header,
    overview,
    profile,
    roles,
    competencies,
    pastoral
  };
}
