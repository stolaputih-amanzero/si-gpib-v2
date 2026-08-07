export interface AnalyticsStats {
  total_pos: number;
  pos_growth_month: number;
  total_pendeta: number;
  pendeta_growth_month: number;
  total_jemaat: number;
  jemaat_growth_month: number;
  total_log_pastoral_month: number;
  log_growth_month: number;
}

export interface GrowthTrend {
  month: string;
  pos_count: number;
  pastoral_count: number;
}

export interface MupelDistribution {
  nama_mupel: string;
  pos_count: number;
  pendeta_count: number;
}

export interface PosLocation {
  id_pos: string;
  nama_pos: string;
  latitude: number;
  longitude: number;
  nama_jemaat: string;
  nama_mupel: string;
}

export interface AnalyticsDashboardData {
  stats: AnalyticsStats;
  growth_trends: GrowthTrend[];
  mupel_distribution: MupelDistribution[];
  pos_locations: PosLocation[];
}

export interface AnalyticsFilter {
  idMupel?: string;
  idInduk?: string;
}
