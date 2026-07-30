'use client';

import { useRiwayatMutasi } from '@/hooks/use-profile';
import { VerticalTimeline } from '../timeline/VerticalTimeline';
import { History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface RiwayatMutasiSectionProps {
  idPendeta?: string | null;
}

export function RiwayatMutasiSection({ idPendeta }: RiwayatMutasiSectionProps) {
  const { data: mutasiList, isLoading } = useRiwayatMutasi(idPendeta);

  if (!idPendeta) {
    return (
      <div className="card-flat p-8 text-center space-y-2 bg-surface-1 border border-line-subtle animate-rise">
        <History size={32} className="mx-auto text-ink-tertiary opacity-40" />
        <p className="font-semibold text-sm text-ink-primary">Riwayat Mutasi Penugasan</p>
        <p className="text-xs text-ink-tertiary">
          Pengguna ini bukan merupakan Pendeta GPIB yang memiliki riwayat mutasi struktural.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="card-flat p-6 h-64 skeleton" />;
  }

  const timelineItems = (mutasiList || []).map((m) => {
    let jenisTitle = 'Mutasi Penugasan';
    let badgeStyle = 'bg-info-soft text-info';

    if (m.jenis_mutasi?.toUpperCase().includes('KMJ')) {
      jenisTitle = 'Pengangkatan KMJ';
      badgeStyle = 'bg-ok-soft text-ok';
    } else if (m.jenis_mutasi?.toUpperCase().includes('PJ')) {
      jenisTitle = 'Penetapan PJ Pos';
      badgeStyle = 'bg-surface-brand text-brand-600';
    }

    const lamaStr = m.nama_induk_lama || m.id_induk_lama || 'Penugasan Awal';
    const baruStr = m.nama_induk_baru || m.id_induk_baru || 'Tujuan Mutasi';

    return {
      id: m.id_mutasi,
      date: m.tgl_mutasi,
      title: jenisTitle,
      subtitle: m.alasan ? `Alasan: ${m.alasan}` : undefined,
      body: `${lamaStr}  ➔  ${baruStr}`,
      badge: (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}`}>
          {m.jenis_mutasi}
        </span>
      ),
    };
  });

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: id });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card-flat p-5 space-y-5 bg-surface-1 animate-rise">
      <div className="flex items-center justify-between border-b border-line-hairline pb-3">
        <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
          <History size={18} className="text-brand-600" />
          <span>Riwayat Mutasi & Perjalanan Penugasan</span>
        </h3>
        <span className="text-xs font-mono text-ink-tertiary tnum">
          {timelineItems.length} Catatan
        </span>
      </div>

      <VerticalTimeline
        items={timelineItems}
        emptyMessage="Belum ada catatan riwayat mutasi pendeta terdaftar."
        formatDateFn={formatDate}
      />
    </div>
  );
}
