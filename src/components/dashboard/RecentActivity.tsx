import { Activity, ArrowRight, User, Sprout, Church } from 'lucide-react';
import Link from 'next/link';

interface LogData {
  id_log: string;
  tgl: string;
  kegiatan: string;
  pos_pelkes: { nama_pos: string } | null;
  pendeta: { nama_lengkap: string } | null;
  tipe?: string;
}

export function RecentActivity({ logs }: { logs: LogData[] }) {
  return (
    <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-surface-1 p-5 sm:p-6 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Activity className="size-4.5" />
          </div>
          <div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-ink-primary">
              Aktivitas Terbaru
            </h3>
            <p className="micro-label text-ink-tertiary">Log Pastoral &amp; Status</p>
          </div>
        </div>
        <Link href="/dashboard/aktivitas" className="micro-label text-amber-700 dark:text-amber-400 hover:underline flex items-center">
          Lihat Semua <ArrowRight className="size-3 ml-1" />
        </Link>
      </div>

      <div className="flex-1">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-ink-secondary text-sm italic py-8">
            Belum ada aktivitas pelayanan
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const posName = log.pos_pelkes?.nama_pos || '';
              const isBajem = (posName.toLowerCase().includes('bajem'));

              return (
                <div key={log.id_log} className="flex gap-3 group">
                  <div className="flex flex-col items-center mt-1">
                    <div className="size-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/15" />
                    <div className="w-px h-full bg-stone-200 dark:bg-stone-800 mt-1.5" />
                  </div>
                  <div className="pb-2 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-ink-primary leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {log.kegiatan}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-ink-secondary mt-1">
                      {isBajem ? (
                        <Church size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Sprout size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                      <span className="truncate">{posName || 'Pos Pelkes'}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] text-ink-tertiary bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/50 dark:border-stone-800/60 px-2 py-0.5 rounded-full inline-flex">
                      <User className="size-3" />
                      <span>{log.pendeta?.nama_lengkap || 'Pelayan'} • {new Date(log.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

