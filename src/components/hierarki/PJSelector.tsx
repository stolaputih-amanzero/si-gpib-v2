'use client';

import { useState } from 'react';
import { usePendetaList } from '@/hooks/use-pendeta';
import { useAssignPj } from '@/hooks/use-hierarki';
import { HeartHandshake, Search, Loader2, CheckCircle2, AlertCircle, X, Users } from 'lucide-react';

interface PJSelectorProps {
  id_induk: string;
  nama_induk: string;
  onSuccess?: () => void;
  onClose: () => void;
}

export function PJSelector({
  id_induk,
  nama_induk,
  onSuccess,
  onClose,
}: PJSelectorProps) {
  const [filterMode, setFilterMode] = useState<'jemaat' | 'all'>('jemaat');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPendetaId, setSelectedPendetaId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch pendeta: either filtered by jemaat or all
  const { data: pendetaList, isLoading } = usePendetaList({
    id_induk: filterMode === 'jemaat' ? id_induk : undefined,
    search: searchQuery
  });
  const assignPjMutation = useAssignPj();

  const handleAssign = async () => {
    if (!selectedPendetaId) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await assignPjMutation.mutateAsync({
        id_induk,
        id_pendeta: selectedPendetaId,
      });

      setSuccessMsg('Pendeta Jemaat (PJ) berhasil ditugaskan!');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1200);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses penugasan PJ.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] bg-surface-elevated rounded-3xl p-5 shadow-float border border-border-subtle flex flex-col relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HeartHandshake size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-text-high text-base">Tambah Penugasan PJ</h3>
              <p className="text-xs text-text-muted">{nama_induk} ({id_induk})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-text-muted hover:text-text-high bg-surface-sunken transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Toggle: Jemaat Ini vs Semua Pendeta */}
        <div className="flex items-center gap-2 p-1 bg-surface-sunken rounded-xl border border-border-subtle mt-3">
          <button
            type="button"
            onClick={() => setFilterMode('jemaat')}
            className={`flex-1 min-h-[36px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'jemaat'
                ? 'bg-surface-elevated text-emerald-600 shadow-sm'
                : 'text-text-muted hover:text-text-high'
            }`}
          >
            Pendeta Jemaat Ini
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`flex-1 min-h-[36px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-surface-elevated text-emerald-600 shadow-sm'
                : 'text-text-muted hover:text-text-high'
            }`}
          >
            Semua Pendeta GPIB
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-medium dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative my-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Cari nama pendeta atau jemaat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {/* List Pendeta Selection */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px] max-h-[300px]">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-text-muted">Memuat daftar pendeta...</div>
          ) : !pendetaList || pendetaList.length === 0 ? (
            <div className="p-6 text-center bg-surface-sunken rounded-2xl text-xs text-text-muted space-y-1">
              <Users className="w-6 h-6 mx-auto opacity-50 text-emerald-500 mb-1" />
              <p className="font-semibold">Tidak ada pendeta ditemukan.</p>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline text-xs mt-1"
              >
                Cari di seluruh daftar pendeta GPIB
              </button>
            </div>
          ) : (
            pendetaList.map((pendeta) => {
              const isSelected = selectedPendetaId === pendeta.id_pendeta;

              return (
                <button
                  key={pendeta.id_pendeta}
                  type="button"
                  onClick={() => setSelectedPendetaId(pendeta.id_pendeta)}
                  className={`w-full min-h-[48px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                      : 'border-border-subtle bg-surface-base hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-text-muted bg-surface-elevated'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-text-high leading-snug">
                        {pendeta.nama_lengkap}
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        {pendeta.jemaat_induk?.nama_induk ? `Jemaat: ${pendeta.jemaat_induk.nama_induk}` : 'Unassigned'} {pendeta.no_wa ? `• WA: ${pendeta.no_wa}` : ''}
                      </p>
                    </div>
                  </div>

                  {pendeta.is_pj && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      PJ Aktif
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border-subtle mt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-4 rounded-xl border border-border-subtle text-xs font-semibold text-text-muted hover:text-text-high transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!selectedPendetaId || assignPjMutation.isPending}
            onClick={handleAssign}
            className="flex-1 min-h-[48px] bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-soft"
          >
            {assignPjMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <HeartHandshake size={16} />
                <span>Tugaskan Sebagai PJ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
