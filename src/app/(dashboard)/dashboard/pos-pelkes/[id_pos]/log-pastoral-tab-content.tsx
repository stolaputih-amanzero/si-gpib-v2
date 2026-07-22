'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Activity, X } from 'lucide-react';
import LogPastoralBaruForm from '@/components/pastoral/LogPastoralForm';

interface LogPastoralItem {
  id_log: string;
  tgl: string;
  kegiatan: string;
  jml_jiwa: number | null;
  catatan: string | null;
  pendeta?: { nama_lengkap: string } | null;
}

interface LogPastoralTabContentProps {
  id_pos: string;
  id_induk: string;
  initialLogs: LogPastoralItem[];
  canWrite: boolean;
}

export function LogPastoralTabContent({ id_pos, id_induk, initialLogs, canWrite }: LogPastoralTabContentProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const logs = initialLogs;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="text-base font-black text-text-high">Riwayat Kegiatan Pastoral</h2>
          <p className="text-xs text-text-muted mt-0.5">Catatan kunjungan & kegiatan pelayanan pastoral</p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[36px]"
          >
            <Plus size={14} />
            <span>Tambah Log Pastoral</span>
          </button>
        )}
      </div>

      <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-5 shadow-soft">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-text-muted space-y-1">
            <Activity size={36} className="mx-auto text-text-muted/40 animate-pulse" />
            <p className="text-sm font-bold">Belum ada Log Pastoral</p>
            <p className="text-xs">Catatan kunjungan pastoral belum terekam di sistem.</p>
            {canWrite && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-all shadow-soft active:scale-95"
                >
                  <Plus size={14} />
                  <span>Tambah Log Pastoral</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="relative border-l-2 border-border-strong ml-4 space-y-6 py-2">
            {logs.map((log) => (
              <div key={log.id_log} className="relative pl-6">
                {/* Timeline Circle */}
                <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-brand-primary border-4 border-surface-base" />

                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-extrabold text-sm text-text-high">{log.kegiatan}</h4>
                    <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase shrink-0">
                      {new Date(log.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted">
                    Dilayani oleh: <span className="font-semibold text-text-high">{log.pendeta?.nama_lengkap || 'Pendeta Jemaat'}</span>
                    {log.jml_jiwa ? ` • Melibatkan ${log.jml_jiwa} Jiwa` : ''}
                  </p>

                  {log.catatan && (
                    <div className="text-xs text-text-high bg-surface-sunken p-3 rounded-xl border border-border-subtle italic leading-relaxed whitespace-pre-wrap">
                      "{log.catatan}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-Page Standard Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-elevated w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-border-subtle shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-sunken/50 shrink-0">
              <h3 className="font-serif font-bold text-text-high text-lg">
                Input Log Pastoral Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl bg-surface-sunken hover:bg-surface-elevated text-text-muted flex items-center justify-center transition-colors shadow-xs"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <LogPastoralBaruForm
                id_pos={id_pos}
                id_induk={id_induk}
                onSuccess={() => {
                  setShowModal(false);
                  router.refresh();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
