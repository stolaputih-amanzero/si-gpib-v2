'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { aggregateDemografi } from '@/lib/utils/demografi-aggregator';

export function useExportDemografi(posName: string, data: any[]) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = () => {
    setIsExporting(true);
    try {
      if (typeof window !== 'undefined') {
        window.print();
      }
      toast.success('Laporan Siap Dicetak / PDF', 'Gunakan dialog cetak browser untuk menyimpan sebagai PDF.');
    } catch (err: any) {
      toast.error('Gagal Ekspor PDF', err?.message || 'Terjadi kesalahan saat mencetak.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = () => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) {
        toast.error('Data Kosong', 'Tidak ada data demografi untuk diekspor.');
        return;
      }

      const headers = ['Kategori Pelkat', 'Jumlah KK', 'Laki-Laki', 'Perempuan', 'Total Jiwa', 'Profesi', 'Pendidikan'];
      const rows = data.map((d) => [
        d.kategori_pelkat,
        d.jml_kk || 0,
        d.laki || 0,
        d.perempuan || 0,
        (d.laki || 0) + (d.perempuan || 0),
        `"${(d.profesi || '').replace(/"/g, '""')}"`,
        `"${(d.pendidikan || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Demografi_${posName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Ekspor Excel/CSV Berhasil', `File demografi ${posName} berhasil diunduh.`);
    } catch (err: any) {
      toast.error('Gagal Ekspor Excel', err?.message || 'Terjadi kesalahan.');
    } finally {
      setIsExporting(false);
    }
  };

  const shareWhatsApp = () => {
    try {
      const summary = aggregateDemografi(data);
      const text = `📊 *LAPORAN DEMOGRAFI PELKAT - GPIB*\n📍 *Pos Pelkes:* ${posName}\n🗓️ *Tanggal:* ${new Date().toLocaleDateString('id-ID')}\n\n*RINGKASAN TOTAL:*\n• Total KK: ${summary.totalKK} KK\n• Total Jiwa: ${summary.totalJiwa} Jiwa\n• Laki-Laki: ${summary.totalLaki} Jiwa\n• Perempuan: ${summary.totalPerempuan} Jiwa\n\n_Diproses melalui SI GPIB v2.2_`;

      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      toast.success('Buka WhatsApp', 'Ringkasan demografi siap dibagikan via WA.');
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
