'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { KPIStats } from '@/hooks/use-analitik';

export function useExportAnalitik(mupelName?: string, jemaatName?: string) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = () => {
    setIsExporting(true);
    try {
      if (typeof window !== 'undefined') {
        window.print();
      }
      toast.success('Cetak / PDF', 'Gunakan dialog cetak browser untuk menyimpan laporan analitik sebagai PDF.');
    } catch (err: any) {
      toast.error('Gagal Ekspor PDF', err?.message || 'Terjadi kesalahan saat mencetak.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = (kpiData?: KPIStats | null) => {
    setIsExporting(true);
    try {
      const headers = ['Metrik Analitik', 'Nilai Agregat', 'Lingkup Filter'];
      const scopeText = jemaatName ? `Jemaat ${jemaatName}` : mupelName ? `Mupel ${mupelName}` : 'Semua Mupel Sinode';

      const rows = [
        ['Total Pos Pelkes & Bajem', kpiData?.totalPos || 0, scopeText],
        ['Total Jiwa (6 Pelkat)', kpiData?.totalJiwa || 0, scopeText],
        ['Pendeta Aktif', kpiData?.totalPendeta || 0, scopeText],
        ['Total Aset Pos', kpiData?.totalAset || 0, scopeText],
        ['Pengajuan Bantuan Pending', kpiData?.totalBantuanPending || 0, scopeText],
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Laporan_Analitik_GPIB_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Ekspor Excel / CSV Berhasil', 'Laporan agregat analitik berhasil diunduh.');
    } catch (err: any) {
      toast.error('Gagal Ekspor CSV', err?.message || 'Terjadi kesalahan.');
    } finally {
      setIsExporting(false);
    }
  };

  const shareWhatsApp = (kpiData?: KPIStats | null) => {
    try {
      const scopeText = jemaatName ? `Jemaat ${jemaatName}` : mupelName ? `Mupel ${mupelName}` : 'Semua Mupel Sinode';

      const text = `📊 *DASHBOARD ANALITIK - SI GPIB v2.2*\n📍 *Lingkup:* ${scopeText}\n🗓️ *Tanggal:* ${new Date().toLocaleDateString('id-ID')}\n\n*RINGKASAN METRIK KPI:*\n• Total Pos Pelkes: ${kpiData?.totalPos || 0}\n• Total Jiwa: ${kpiData?.totalJiwa || 0}\n• Pendeta Aktif: ${kpiData?.totalPendeta || 0}\n• Total Aset: ${kpiData?.totalAset || 0}\n• Bantuan Pending: ${kpiData?.totalBantuanPending || 0}\n\n_Diprosess melalui SI GPIB v2.2_`;

      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      toast.success('Buka WhatsApp', 'Ringkasan laporan analitik siap dibagikan via WA.');
    } catch (err: any) {
      toast.error('Gagal Share WhatsApp', err?.message || 'Terjadi kesalahan.');
    }
  };

  return {
    exportPDF,
    exportExcel,
    shareWhatsApp,
    isExporting,
  };
}
