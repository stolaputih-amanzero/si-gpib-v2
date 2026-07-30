'use client';

import Link from 'next/link';
import { useLogPastoralRingkas } from '@/hooks/use-profile';
import { FileText, Users, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface LogPastoralSectionProps {
  idPendeta?: string | null;
}

export function LogPastoralSection({ idPendeta }: LogPastoralSectionProps) {
  const { data: logs, isLoading } = useLogPastoralRingkas(idPendeta);

  if (!idPendeta) {
    return (
      <div className="card-flat p-8 text-center space-y-2 bg-surface-1 border border-line-subtle animate-rise">
        <FileText size={32} className="mx-auto text-ink-tertiary opacity-40" />
        <p className="font-semibold text-sm text-ink-primary">Log Pastoral & Kunjungan</p>
        <p className="text-xs text-ink-tertiary">
          Log Pastoral Kunjungan hanya dapat dicatat oleh pengguna yang terikat akun Pendeta GPIB.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="card-flat p-6 h-64 skeleton" />;
  }

  return (
    <div className="card-flat p-5 space-y-4 bg-surface-1 animate-rise">
      <div className="flex items-center justify-between border-b border-line-hairline pb-3">
        <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
          <FileText size={18} className="text-brand-600" />
          <span>8 Log Pastoral Kunjungan Terakhir</span>
        </h3>
        <span className="text-xs font-mono text-ink-tertiary tnum">
          {logs?.length || 0} Terakhir
        </span>
      </div>

      {logs && logs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {logs.map((log) => {
            let tglFormatted = log.tgl_kegiatan;
            try {
              tglFormatted = format(parseISO(log.tgl_kegiatan), 'dd MMM yyyy', { locale: id });
            } catch {}

            return (
              <div
                key={log.id_log}
                className="p-4 rounded-2xl bg-surface-sunken border border-line-subtle hover:border-brand-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-medium text-ink-tertiary flex items-center gap-1 tnum">
                    <Calendar size={12} />
                    <span>{tglFormatted}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-ok-soft text-ok border border-ok/20 tnum">
                    <Users size={12} /> {log.jumlah_jiwa} Jiwa
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-ink-primary line-clamp-1">
                  {log.kegiatan}
                </h4>

                {log.nama_pos && (
                  <p className="text-xs text-brand-600 flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{log.nama_pos}</span>
                  </p>
                )}

                {log.catatan && (
                  <p className="text-xs text-ink-secondary line-clamp-2 bg-surface-1 p-2 rounded-xl border border-line-hairline mt-1">
                    {log.catatan}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-surface-sunken border border-line-subtle text-center text-xs text-ink-tertiary">
          Belum ada catatan log pastoral kunjungan terdaftar.
        </div>
      )}

      {/* Footer Link */}
      <div className="pt-3 border-t border-line-hairline flex justify-end">
        <Link
          href={`/laporan/pastoral?pendeta=${idPendeta}`}
          className="btn btn-ghost text-xs font-bold min-h-[44px]"
        >
          <span>Lihat Semua Log Pastoral</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
