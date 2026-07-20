import { createClient } from "@/lib/supabase/server";
import { StatCards } from "@/components/dashboard/StatCards";
import { DemografiChart } from "@/components/dashboard/DemografiChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";

// --- Types ---
interface DemografiRow {
  kategori_pelkat: string;
  laki: number;
  perempuan: number;
}

export default async function Dashboard() {
  const supabase = await createClient();

  // Current month bounds for pastoral logs
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  // Execute ALL database queries concurrently in parallel to eliminate network waterfall lag
  const [
    { count: posCount },
    { count: jemaatCount },
    { count: logCount },
    { data: demografiData },
    { data: recentLogs }
  ] = await Promise.all([
    supabase.from('m_pos_pelkes').select('*', { count: 'exact', head: true }),
    supabase.from('m_jemaat_induk').select('*', { count: 'exact', head: true }),
    supabase
      .from('t_log_pastoral')
      .select('*', { count: 'exact', head: true })
      .gte('tgl', startOfMonth)
      .lte('tgl', endOfMonth),
    supabase
      .from('t_demografi_pelkat')
      .select('kategori_pelkat, laki, perempuan'),
    supabase
      .from('t_log_pastoral')
      .select(`
        id_log, tgl, kegiatan,
        pos_pelkes:m_pos_pelkes(nama_pos),
        pendeta:m_pendeta(nama_lengkap)
      `)
      .order('tgl', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  // Process Demografi Data
  let totalJiwa = 0;
  const chartDataMap: Record<string, number> = {
    'Pelayanan Anak (PA)': 0,
    'Persekutuan Teruna (PT)': 0,
    'Gerakan Pemuda (GP)': 0,
    'Persekutuan Kaum Perempuan (PKP)': 0,
    'Persekutuan Kaum Bapak (PKB)': 0,
    'Persekutuan Kaum Lanjut Usia (PKLU)': 0,
  };

  if (demografiData) {
    (demografiData as DemografiRow[]).forEach((row) => {
      const sum = row.laki + row.perempuan;
      totalJiwa += sum;
      
      let category = row.kategori_pelkat;
      if (category.toLowerCase().includes('anak')) category = 'PA';
      else if (category.toLowerCase().includes('teruna')) category = 'PT';
      else if (category.toLowerCase().includes('pemuda')) category = 'GP';
      else if (category.toLowerCase().includes('perempuan')) category = 'PKP';
      else if (category.toLowerCase().includes('bapak') || category.toLowerCase().includes('bapa')) category = 'PKB';
      else if (category.toLowerCase().includes('lanjut usia') || category.toLowerCase().includes('lansia')) category = 'PKLU';
      else category = category.substring(0, 4).toUpperCase();
      
      chartDataMap[category] = (chartDataMap[category] || 0) + sum;
    });
  }

  // Convert map to array for Recharts
  const chartData = Object.entries(chartDataMap)
    .map(([name, total]) => ({ name, total }))
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen bg-surface-base pb-28">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe px-4 py-3.5 md:px-6">
        <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">Dashboard Utama</h1>
        <p className="text-xs md:text-sm text-text-muted mt-0.5">Sistem Informasi Pelayanan & Kesaksian GPIB</p>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-5 md:px-6 space-y-6">
        {/* Row 1: KPI Cards */}
        <StatCards 
          posCount={posCount || 0}
          jemaatCount={jemaatCount || 0}
          totalJiwa={totalJiwa}
          logCount={logCount || 0}
        />

        {/* Row 2: Charts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DemografiChart data={chartData} />
          </div>
          <div>
            <RecentActivity logs={recentLogs as any || []} />
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <QuickActions />
    </div>
  );
}


