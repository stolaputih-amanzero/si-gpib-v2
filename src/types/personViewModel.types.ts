import { 
  PrivacyReason, 
  PersonIdentity, 
  PersonAssignment, 
  PersonMutationHistory,
  PersonFamilyMember,
  PersonEmergencyContact,
  PersonBiometricDevice,
  PersonEducation,
  PersonCertification,
  PastoralSchedule,
  PastoralPaginationMeta
} from './person.types';

/**
 * 3 Discriminated UI Render States
 */
export type FieldRenderState<T> = 
  | { type: 'DATA'; value: T }
  | { type: 'EMPTY'; label: string }
  | { type: 'PRIVACY_MASKED'; reason: PrivacyReason; label: string };

/**
 * Person Header ViewModel ("Siapa orang ini?")
 */
export interface PersonHeaderViewModel {
  id_person: string;
  identity: PersonIdentity;
  primaryRoleLabel: string | null;
  organizationName: string | null;
  isActive: boolean | null;
}

/**
 * Section 1: Overview
 */
export interface OverviewViewModel {
  currentRoleLabel: FieldRenderState<string>;
  organizationName: FieldRenderState<string>;
  isActive: FieldRenderState<boolean>;
  recentPastoralCount: FieldRenderState<number>;
  affiliationOrigin: FieldRenderState<string>;
}

/**
 * Section 2: Profile
 */
export interface ProfileViewModel {
  tempatLahir: FieldRenderState<string>;
  tanggalLahir: FieldRenderState<string>;
  noHp: FieldRenderState<string>;
  email: FieldRenderState<string>;
  alamatTinggal: FieldRenderState<string>;
  keluarga: FieldRenderState<PersonFamilyMember[]>;
  kontakDarurat: FieldRenderState<PersonEmergencyContact[]>;
  biometricDevices: FieldRenderState<PersonBiometricDevice[]>;
}

/**
 * Section 3: Roles & Assignments
 */
export interface RolesViewModel {
  assignments: FieldRenderState<PersonAssignment[]>;
  mutations: FieldRenderState<PersonMutationHistory[]>;
}

/**
 * Section 4: Competencies
 */
export interface CompetenciesViewModel {
  skills: FieldRenderState<string[]>;
  education: FieldRenderState<PersonEducation[]>;
  certifications: FieldRenderState<PersonCertification[]>;
}

/**
 * Granular Log Pastoral Item dengan Notes Privacy tersendiri
 */
export interface PastoralLogItemViewModel {
  id_log: string;
  tanggal: string;
  tipe_layanan: string;
  status: string | null;
  notes: FieldRenderState<string>;
}

/**
 * Section 5: Pastoral
 */
export interface PastoralViewModel {
  upcomingSchedules: FieldRenderState<PastoralSchedule[]>;
  pastoralLogs: FieldRenderState<PastoralLogItemViewModel[]>;
  pagination: PastoralPaginationMeta;
}

/**
 * Combined Person Workspace ViewModel
 */
export interface PersonWorkspaceViewModel {
  id_person: string;
  header: PersonHeaderViewModel;
  overview: OverviewViewModel;
  profile: ProfileViewModel;
  roles: RolesViewModel;
  competencies: CompetenciesViewModel;
  pastoral: PastoralViewModel;
}
