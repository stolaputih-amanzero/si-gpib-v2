export interface LegacyUnifiedPersonData {
  id: string;
  name: string;
  nip: string | null;
  status: string;
  avatar_url: string | null;
  bio: any;
  stats: any;
  keluarga: any[] | null;
  kompetensi: any[];
  keterlibatan: any[];
  mutasi: any[];
  jabatan: any[];
  biometric: any[] | null;
  audit_log: any[] | null;
  penugasan: any[];
  log_pastoral: any[];
  can_see_private: boolean;
}
