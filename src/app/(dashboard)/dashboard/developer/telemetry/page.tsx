'use client';

import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Activity, Clock, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/utils/logger';

const TelemetryCharts = dynamic(() => import('./charts'), { ssr: false });

export default function TelemetryDashboardPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Assume RLS handles access control, but we'll try to fetch.
      
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error: fetchError } = await supabase
        .from('sys_telemetry')
        .select('*')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setMetrics(data || []);
    } catch (err: any) {
      logger.error('Failed to fetch telemetry', err);
      setError(err.message || 'Failed to load telemetry data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 flex items-center"><AlertTriangle className="mr-2" /> Error: {error}</div>;
  }

  const syncEvents = metrics.filter(m => m.event_type === 'sync_complete');
  const avgDuration = syncEvents.length > 0
    ? Math.round(syncEvents.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / syncEvents.length)
    : 0;
  
  const totalSuccess = syncEvents.reduce((sum, e) => sum + (e.success_count || 0), 0);
  const totalFail = syncEvents.reduce((sum, e) => sum + (e.fail_count || 0), 0);
  const failureRate = totalSuccess + totalFail > 0
    ? ((totalFail / (totalSuccess + totalFail)) * 100).toFixed(2)
    : '0';

  const conflictCount = metrics.filter(m => m.event_type === 'conflict_detected').length;
  const dlqCount = metrics.filter(m => m.event_type === 'dlq_moved').length;

  // Prepare chart data
  const chartData = syncEvents.map((e, index) => ({
    name: `Sync ${syncEvents.length - index}`,
    duration: e.duration_ms || 0,
    failures: e.fail_count || 0,
    successes: e.success_count || 0,
    date: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })).reverse();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📊 Telemetry Sinkronisasi</h1>
          <p className="text-muted-foreground mt-1">Laporan keandalan antrean offline (7 hari terakhir)</p>
        </div>
        <button onClick={fetchMetrics} className="flex items-center text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="w-4 h-4 mr-1" /> Total Syncs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" /> Failure Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${Number(failureRate) > 5 ? 'text-red-500' : 'text-green-600'}`}>
              {failureRate}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <RefreshCw className="w-4 h-4 mr-1" /> Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${conflictCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {conflictCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" /> Dead Letters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dlqCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {dlqCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <TelemetryCharts chartData={chartData} />
    </div>
  );
}
