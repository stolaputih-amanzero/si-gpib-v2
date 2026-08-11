import { createClient } from '@/lib/supabase/client';
import type { AnalyticsFilter, AnalyticsDashboardData } from './analytics.types';
import * as XLSX from 'xlsx';

export async function fetchAnalyticsData(filter?: AnalyticsFilter): Promise<AnalyticsDashboardData> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_analytics_dashboard_data', {
    p_id_mupel: filter?.idMupel || null,
    p_id_induk: filter?.idInduk || null,
  });

  if (error) {
    const errorMsg = error.message || error.details || error.hint || (typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error));
    console.error('Error fetching analytics data:', errorMsg);
    // Fallback default structure if RPC doesn't exist yet or fails
    return {
      stats: {
        total_pos: 0,
        pos_growth_month: 0,
        total_pendeta: 0,
        pendeta_growth_month: 0,
        total_jemaat: 0,
        jemaat_growth_month: 0,
        total_log_pastoral_month: 0,
        log_growth_month: 0,
      },
      growth_trends: [],
      mupel_distribution: [],
      pos_locations: [],
    };
  }

  return data as AnalyticsDashboardData;
}

export function exportAnalyticsToExcel(data: AnalyticsDashboardData) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Key Metrics
  const statsRows = [
    { Metric: 'Total Pos Pelkes', Value: data.stats.total_pos, 'Pertumbuhan Bulan Ini': `+${data.stats.pos_growth_month}` },
    { Metric: 'Total Pendeta', Value: data.stats.total_pendeta, 'Pertumbuhan Bulan Ini': `+${data.stats.pendeta_growth_month}` },
    { Metric: 'Total Jemaat Induk', Value: data.stats.total_jemaat, 'Pertumbuhan Bulan Ini': `+${data.stats.jemaat_growth_month}` },
    { Metric: 'Log Pastoral Bulan Ini', Value: data.stats.total_log_pastoral_month, 'Pertumbuhan Bulan Ini': `+${data.stats.log_growth_month}` },
  ];
  const statsSheet = XLSX.utils.json_to_sheet(statsRows);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Ringkasan KPI');

  // Sheet 2: Growth Trends
  if (data.growth_trends.length > 0) {
    const growthSheet = XLSX.utils.json_to_sheet(data.growth_trends);
    XLSX.utils.book_append_sheet(workbook, growthSheet, 'Tren Pertumbuhan');
  }

  // Sheet 3: Mupel Distribution
  if (data.mupel_distribution.length > 0) {
    const mupelSheet = XLSX.utils.json_to_sheet(data.mupel_distribution);
    XLSX.utils.book_append_sheet(workbook, mupelSheet, 'Sebaran Mupel');
  }

  // Sheet 4: Pos Pelkes Geo-Locations
  if (data.pos_locations.length > 0) {
    const posSheet = XLSX.utils.json_to_sheet(data.pos_locations);
    XLSX.utils.book_append_sheet(workbook, posSheet, 'Lokasi Pos Pelkes');
  }

  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan-Analitik-GPIB-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
