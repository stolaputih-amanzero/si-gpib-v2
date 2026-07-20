'use client';

import { useHistoriStatus } from '@/hooks/use-hierarki';
import { History, Calendar, FileText, ArrowRight, ShieldAlert, Sparkles, Church } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusHistoryTimelineProps {
  id_pos: string;
}

export function StatusHistoryTimeline({ id_pos }: StatusHistoryTimelineProps) {
  const { data: historiList, isLoading } = useHistoriStatus(id_pos);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 bg-surface-elevated rounded-2xl border border-border-subtle">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (!historiList || historiList.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-text-muted flex items-center gap-2.5">
        <History size={16} className="text-brand-primary opacity-60 shrink-0" />
        <span>Belum ada catatan riwayat perubahan status untuk lokasi pelayanan ini.</span>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Jemaat Induk') return <Church size={14} className="text-purple-600 dark:text-purple-400" />;
    if (status === 'Bajem') return <Sparkles size={14} className="text-brand-primary" />;
    return <ShieldAlert size={14} className="text-emerald-600" />;
  };

  return (
    <div className="p-5 rounded-2xl bg-surface-elevated border border-border-subtle shadow-soft space-y-4">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <History className="w-5 h-5 text-brand-primary" />
        <h3 className="font-extrabold text-text-high text-sm">Riwayat Peningkatan Status</h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary">
          {historiList.length} Catatan
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle">
        {historiList.map((item) => {
          let parsedDate = item.tanggal_perubahan;
          try {
            parsedDate = format(new Date(item.tanggal_perubahan), 'dd MMMM yyyy', { locale: localeId });
          } catch (e) {
            // fallback if invalid format
          }

          return (
            <div key={item.id_histori} className="relative space-y-1.5 group">
              {/* Node Indicator Dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-brand-primary border-2 border-surface-elevated ring-2 ring-brand-primary/20" />

              {/* Card Content */}
              <div className="p-3.5 rounded-xl bg-surface-sunken border border-border-subtle space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="flex items-center gap-1 text-text-muted">
                      {getStatusIcon(item.status_lama)}
                      {item.status_lama}
                    </span>
                    <ArrowRight size={14} className="text-brand-primary shrink-0" />
                    <span className="flex items-center gap-1 text-brand-primary">
                      {getStatusIcon(item.status_baru)}
                      {item.status_baru}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                    <Calendar size={12} />
                    {parsedDate}
                  </span>
                </div>

                {item.id_induk_baru && (
                  <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                    ID Jemaat Induk Baru: <span className="font-bold">{item.id_induk_baru}</span>
                  </p>
                )}

                <p className="text-text-high font-medium whitespace-pre-wrap flex items-start gap-1.5">
                  <FileText size={14} className="text-text-muted shrink-0 mt-0.5" />
                  <span>{item.keterangan_perubahan}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
