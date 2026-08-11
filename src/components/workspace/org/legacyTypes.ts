export interface LegacyUnifiedOrganizationData {
  id: string;
  name: string;
  level: string;
  subtype?: string;
  parent_jemaat?: any;
  parent_mupel?: any;
  status: string;
  kpis: any;
  child_organizations: any[];
  sdm_list: any[];
  assets: any;
  wilayah: any;
  aid_requests: any;
  demographics: any;
  pastoral_logs: any[];
  jadwal_ibadah: any[];
  profile: any;
  can_see_private: boolean;
}
