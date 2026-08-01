'use client';

import { useState } from 'react';
import {
  useKerawananList,
  usePosPelkesList,
  useDeleteKerawanan,
  KerawananItem,
} from '@/hooks/use-wilayah';
import { KerawananForm } from '@/components/wilayah/KerawananForm';
import { useToast } from '@/components/ui/toast';
import { shareKerawananWA } from '@/lib/share/share-kerawanan-wa';
import {
  ShieldAlert,
  Search,
  Trash2,
  X,
  AlertTriangle,
  Share2,
  Edit2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ListRow } from '@/components/list/ListRow';
import { FilterChips } from '@/components/list/FilterChips';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { EmptyState } from '@/components/list/EmptyState';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { Badge } from '@/components/ui/badge';
import { PosName } from '@/components/ui/PosName';

export default function LaporanKerawananPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showKerawananModal, setShowKerawananModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<KerawananItem | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<KerawananItem | null>(null);

  const { data: kerawananList, isLoading: isLoadingKerawanan } = useKerawananList(selectedPosFilter);
  const { data: posPelkesList } = usePosPelkesList();
  const deleteKerawananMutation = useDeleteKerawanan();



  const filteredKerawanan = (kerawananList || []).filter((k) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      k.jenis_risiko.toLowerCase().includes(q) ||
      k.kategori.toLowerCase().includes(q) ||
      (k.pos?.nama_pos || '').toLowerCase().includes(q) ||
      (k.keterangan || '').toLowerCase().includes(q)
    );
  });

  const handleDeleteKerawanan = (id_risiko: string) => {
    confirmModal({
      title: 'Hapus Data Kerawanan Wilayah',
      message: 'Apakah Anda yakin ingin menghapus data kerawanan ini? Dokumen lampiran juga akan terhapus.',
      confirmText: 'Hapus Kerawanan',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteKerawananMutation.mutateAsync(id_risiko);
          if (selectedDetail?.id_risiko === id_risiko) setSelectedDetail(null);
          toast.success('Berhasil Dihapus', 'Data kerawanan wilayah telah dihapus.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data kerawanan.');
        }
      },
    });
  };

  const formatDateStr = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const totalRisiko = kerawananList?.length || 0;
  const kritisCount = kerawananList?.filter((k) => k.frekuensi === 'Kritis').length || 0;
  const tinggiCount = kerawananList?.filter((k) => k.frekuensi === 'Tinggi').length || 0;

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary tracking-tight">
            Analisis Kerawanan Wilayah
          </h1>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Pendataan Kerawanan Sosial, Alam, & Tantangan Pelayanan Pos
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowKerawananModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs min-h-[44px] shrink-0"
        >
          <ShieldAlert size={18} />
          <span className="hidden sm:inline">Tambah Kerawanan</span>
          <span className="sm:hidden">Kerawanan</span>
        </button>
      </div>

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Risiko', value: totalRisiko, icon: <ShieldAlert size={16} /> },
          { label: 'Risiko Kritis', value: kritisCount, icon: <AlertTriangle size={16} /> },
          { label: 'Risiko Tinggi', value: tinggiCount },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Filter Controls & Search */}
      <div className="bg-surface-1 p-3 rounded-2xl border border-border-subtle shadow-xs space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Cari jenis risiko, kategori, atau nama pos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[44px]"
          />
        </div>
      </div>

      {/* Filter Chips Pos */}
      <FilterChips
        items={[
          { key: 'all', label: 'Semua Pos Pelkes', count: totalRisiko },
          ...(posPelkesList || []).map((pos) => ({
            key: pos.id_pos,
            label: pos.nama_pos,
          })),
        ]}
        active={selectedPosFilter}
        onChange={(key) => setSelectedPosFilter(key)}
        className="px-0 py-1"
      />

      {/* Kerawanan List */}
      <div className="pt-1">
        {isLoadingKerawanan ? (
          <ListSkeleton count={6} />
        ) : filteredKerawanan.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Belum Ada Data Kerawanan"
            description="Tidak ada data kerawanan wilayah yang sesuai dengan filter pencarian Anda."
            action={{
              label: 'Tambah Kerawanan',
              onClick: () => setShowKerawananModal(true),
              variant: 'primary',
            }}
          />
        ) : (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden">
            {filteredKerawanan.map((item: KerawananItem) => {
              const posName = item.pos?.nama_pos || item.id_pos || '';

              const iconComponent = <ShieldAlert className="h-5 w-5" />;
              const iconVariant =
                item.frekuensi === 'Kritis' ? 'brand' : item.frekuensi === 'Tinggi' ? 'accent' : 'default';

              return (
                <ListRow
                  key={item.id_risiko}
                  icon={iconComponent}
                  iconVariant={iconVariant}
                  title={item.jenis_risiko}
                  subtitle={
                    <span>
                      Kategori: {item.kategori} · Pos: <PosName name={posName} />
                    </span>
                  }
                  meta={
                    <span>
                      Tgl: {formatDateStr(item.created_at)} · Frekuensi: {item.frekuensi}
                    </span>
                  }
                  badge={
                    <Badge
                      variant={item.frekuensi === 'Kritis' ? 'destructive' : item.frekuensi === 'Tinggi' ? 'brand' : 'outline'}
                      className="text-[10px] py-0 px-2"
                    >
                      {item.frekuensi}
                    </Badge>
                  }
                  action={
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => shareKerawananWA(item)}
                        className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Bagikan Ke WA"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedEdit(item)}
                        className="p-2 rounded-xl text-ink-tertiary hover:text-brand-600 hover:bg-surface-brand transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Edit Kerawanan"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteKerawanan(item.id_risiko)}
                        className="p-2 rounded-xl text-ink-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Hapus Kerawanan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  }
                  onClick={() => setSelectedDetail(item)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add Kerawanan */}
      {showKerawananModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-1 rounded-3xl p-2 shadow-lg border border-border-subtle relative animate-slide-up">
            <button
              onClick={() => setShowKerawananModal(false)}
              className="absolute top-4 right-4 p-2 text-ink-tertiary hover:text-ink-primary rounded-full bg-surface-sunken transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <KerawananForm
              defaultPosId={selectedPosFilter !== 'all' ? selectedPosFilter : undefined}
              onSuccess={() => setShowKerawananModal(false)}
              onCancel={() => setShowKerawananModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Kerawanan */}
      {selectedEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-1 rounded-3xl p-2 shadow-lg border border-border-subtle relative animate-slide-up">
            <button
              onClick={() => setSelectedEdit(null)}
              className="absolute top-4 right-4 p-2 text-ink-tertiary hover:text-ink-primary rounded-full bg-surface-sunken transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <KerawananForm
              initialData={selectedEdit}
              onSuccess={() => setSelectedEdit(null)}
              onCancel={() => setSelectedEdit(null)}
            />
          </div>
        </div>
      )}

      {/* Detail Modal Kerawanan Wilayah */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-1 rounded-3xl shadow-lg border border-border-subtle relative animate-slide-up flex flex-col">
            <div className="p-4 sm:p-5 border-b border-border-subtle flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                    {selectedDetail.kategori}
                  </span>
                  <h3 className="font-bold text-ink-primary text-base leading-tight">
                    {selectedDetail.jenis_risiko}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 text-ink-tertiary hover:text-ink-primary rounded-full bg-surface-sunken transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {selectedDetail.keterangan && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-ink-primary uppercase tracking-wider">Keterangan & Mitigasi</h4>
                  <p className="text-ink-primary bg-surface-sunken p-3 rounded-xl border border-border-subtle leading-relaxed whitespace-pre-line">
                    {selectedDetail.keterangan}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border-subtle bg-surface-sunken/40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => shareKerawananWA(selectedDetail)}
                className="flex-1 min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Share2 size={16} />
                <span>WA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
