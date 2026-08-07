'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLogPastoralList } from '@/lib/domains/pastoral/pastoral.queries';
import { usePendetaByJemaat } from '@/hooks/use-pendeta-by-jemaat';
import { usePosPelkesByJemaat } from '@/hooks/use-pos-pelkes-by-jemaat';
import { PastoralStats } from '@/components/pastoral/PastoralStats';
import { PastoralFilter } from '@/components/pastoral/PastoralFilter';
import { PastoralCard } from '@/components/pastoral/PastoralCard';
import { PastoralDetail } from '@/components/pastoral/PastoralDetail';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText } from 'lucide-react';
import { exportLogPastoralToExcel } from '@/lib/domains/pastoral/pastoral.service';
import type { PastoralFilter as PastoralFilterType } from '@/lib/domains/pastoral/pastoral.types';

export default function PastoralPage() {
  const { data: user } = useCurrentUser();
  const [filter, setFilter] = useState<PastoralFilterType>({
    idJemaat: user?.id_induk || '',
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Sync idJemaat when user data loads
  if (user?.id_induk && !filter.idJemaat) {
    setFilter((prev) => ({ ...prev, idJemaat: user.id_induk! }));
  }

  const { data, isLoading, refetch } = useLogPastoralList(filter);
  const { data: pendetaData } = usePendetaByJemaat(filter.idJemaat);
  const pendetaList = pendetaData?.allPendeta || [];
  const { data: posList = [] } = usePosPelkesByJemaat(filter.idJemaat);

  const handleExport = async () => {
    try {
      const csv = await exportLogPastoralToExcel(filter);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `log-pastoral-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor data: ' + (error as Error).message);
    }
  };

  if (!user?.id_induk) {
    return (
      <div className="p-4 text-center text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Anda tidak memiliki akses ke data log pastoral.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 bg-white border-b z-10 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Log Pastoral KMJ</h1>
          <div className="flex gap-2">
            <PastoralFilter
              filter={filter}
              onFilterChange={setFilter}
              pendetaList={pendetaList}
              posList={posList}
            />
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <PastoralStats
          idJemaat={filter.idJemaat}
          startDate={filter.startDate}
          endDate={filter.endDate}
        />
      </div>

      <PullToRefresh onRefresh={async () => { await refetch(); }}>
        <div className="p-4 space-y-4">
          {isLoading ? (
            // Skeleton loading
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : data && data.data.length > 0 ? (
            <>
              {/* Log List */}
              {data.data.map((log) => (
                <PastoralCard
                  key={log.id_log}
                  log={log as any}
                  onClick={() => setSelectedLog(log)}
                />
              ))}

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filter.page === 1}
                    onClick={() => setFilter({ ...filter, page: filter.page! - 1 })}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-gray-600">
                    Halaman {filter.page} dari {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filter.page === data.totalPages}
                    onClick={() => setFilter({ ...filter, page: filter.page! + 1 })}
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Empty state
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Belum ada log pastoral yang cocok dengan filter.</p>
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Detail Modal */}
      <PastoralDetail log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
