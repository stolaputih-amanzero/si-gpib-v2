import { getServerContext } from '@/lib/utils/context';
import { redirect } from 'next/navigation';
import { fetchConsolidatedReportData } from '@/lib/services/reports';
import { ReportsClient } from '@/components/reports/ReportsClient';

export const metadata = {
  title: 'Analytics Hub | SI GPIB',
};

export default async function ReportsPage() {
  const context = await getServerContext();
  if (!context || !context?.context_id) {
    redirect('/auth/login');
  }

  const reportData = await fetchConsolidatedReportData();

  if (!reportData) {
    return (
      <div className="p-8 text-center">
        <p className="text-state-error font-semibold">Akses laporan ditolak atau data tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-base pb-32">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-subtle pt-12 pb-6 px-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-text-strong leading-tight">
            Analytics Hub
          </h1>
          <p className="text-sm text-text-subtle">
            Proyeksi laporan konsolidasi seluruh yurisdiksi Anda
          </p>
        </div>
      </header>

      <main className="flex-1 p-4">
        <ReportsClient initialData={reportData} />
      </main>
    </div>
  );
}
