'use client';

import { useState, useEffect } from 'react';
import {
  usePotensiList,
  usePosPelkesList,
  useDeletePotensi,
  PotensiItem,
} from '@/hooks/use-wilayah';
import { PotensiForm } from '@/components/wilayah/PotensiForm';
import { useToast } from '@/components/ui/toast';
import { sharePotensiWA } from '@/lib/share/share-potensi-wa';
import { createClient } from '@/lib/supabase/client';
import {
  Sparkles,
  Search,
  Trash2,
  X,
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

export default function LaporanPotensiPage() {
  const { toast, confirm: confirmModal } = useToast();
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPotensiModal, setShowPotensiModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<PotensiItem | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<PotensiItem | null>(null);

  const { data: potensiList, isLoading: isLoadingPotensi } = usePotensiList(selectedPosFilter);
  const { data: posPelkesList } = usePosPelkesList();
  const deletePotensiMutation = useDeletePotensi();

  const supabase = createClient();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // user check
      }
    };
    fetchCurrentUser();
  }, [supabase]);

  const filteredPotensi = (potensiList || []).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nama_potensi.toLowerCase().includes(q) ||
      p.kategori.toLowerCase().includes(q) ||
      p.deskripsi.toLowerCase().includes(q) ||
      (p.pos?.nama_pos || '').toLowerCase().includes(q)
    );
  });

  const handleDeletePotensi = (id_potensi: string) => {
    confirmModal({
      title: 'Hapus Data Potensi Wilayah',
      message: 'Apakah Anda yakin ingin menghapus data potensi ini? Dokumen lampiran juga akan terhapus.',
      confirmText: 'Hapus Potensi',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deletePotensiMutation.mutateAsync(id_potensi);
          if (selectedDetail?.id_potensi === id_potensi) setSelectedDetail(null);
          toast.success('Berhasil Dihapus', 'Data potensi wilayah telah dihapus.');
        } catch {
          toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus data potensi.');
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

  const totalPotensi = potensiList?.length || 0;

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-primary tracking-tight">
            Potensi Wilayah & Sumber Daya Pos
          </h1>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Pendataan Peluang Ekonomi, Sosial, Kemitraan & SDM Pos Pelkes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPotensiModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs min-h-[44px] shrink-0"
        >
          <Sparkles size={18} />
          <span className="hidden sm:inline">Tambah Potensi</span>
          <span className="sm:hidden">Potensi</span>
        </button>
      </div>

      {/* Summary Metrics Strip */}
      <SummaryStrip
        metrics={[
          { label: 'Total Potensi', value: totalPotensi, icon: <Sparkles size={16} /> },
        ]}
        className="hairline-b bg-surface-1/40 rounded-xl py-2 px-3"
      />

      {/* Search Input Bar */}
      <div className="bg-surface-1 p-3 rounded-2xl border border-border-subtle shadow-xs">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Cari potensi, deskripsi, atau pos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[44px]"
          />
        </div>
      </div>

      {/* Filter Chips Pos */}
      <FilterChips
        items={[
          { key: 'all', label: 'Semua Pos Pelkes', count: totalPotensi },
          ...(posPelkesList || []).map((pos) => ({
            key: pos.id_pos,
            label: pos.nama_pos,
          })),
        ]}
        active={selectedPosFilter}
        onChange={(key) => setSelectedPosFilter(key)}
        className="px-0 py-1"
      />

      {/* Potensi List */}
      <div className="pt-1">
        {isLoadingPotensi ? (
          <ListSkeleton count={6} />
        ) : filteredPotensi.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Belum Ada Data Potensi"
            description="Tidak ada data potensi wilayah yang sesuai dengan filter pencarian Anda."
            action={{
              label: 'Tambah Potensi Baru',
              onClick: () => setShowPotensiModal(true),
              variant: 'primary',
            }}
          />
        ) : (
          <div className="divide-y divide-line-hairline bg-surface-1 hairline-t hairline-b rounded-2xl overflow-hidden">
            {filteredPotensi.map((item: PotensiItem) => {
              const posName = item.pos?.nama_pos || item.id_pos || '';

              return (
                <ListRow
                  key={item.id_potensi}
                  icon={<Sparkles className="h-5 w-5" />}
                  iconVariant="accent"
                  title={item.nama_potensi}
                  subtitle={
                    <span>
                      Kategori: {item.kategori} · Pos: <PosName name={posName} />
                    </span>
                  }
                  meta={
                    <span>
                      Tgl: {formatDateStr(item.created_at)} · {item.deskripsi}
                    </span>
                  }
                  badge={
                    <Badge variant="outline" className="bg-surface-accent text-accent-600 border-accent-300/40 text-[10px] py-0 px-2">
                      {item.kategori}
                    </Badge>
                  }
                  action={
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => sharePotensiWA(item)}
                        className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Bagikan Ke WA"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedEdit(item)}
                        className="p-2 rounded-xl text-ink-tertiary hover:text-brand-600 hover:bg-surface-brand transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Edit Potensi"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePotensi(item.id_potensi)}
                        className="p-2 rounded-xl text-ink-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Hapus Potensi"
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

      {/* Modal Add Potensi */}
      {showPotensiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-1 rounded-3xl p-2 shadow-lg border border-border-subtle relative animate-slide-up">
            <button
              onClick={() => setShowPotensiModal(false)}
              className="absolute top-4 right-4 p-2 text-ink-tertiary hover:text-ink-primary rounded-full bg-surface-sunken transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <PotensiForm
              defaultPosId={selectedPosFilter !== 'all' ? selectedPosFilter : undefined}
              onSuccess={() => setShowPotensiModal(false)}
              onCancel={() => setShowPotensiModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Edit Potensi */}
      {selectedEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-1 rounded-3xl p-2 shadow-lg border border-border-subtle relative animate-slide-up">
            <button
              onClick={() => setSelectedEdit(null)}
              className="absolute top-4 right-4 p-2 text-ink-tertiary hover:text-ink-primary rounded-full bg-surface-sunken transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <PotensiForm
              initialData={selectedEdit}
              onSuccess={() => setSelectedEdit(null)}
              onCancel={() => setSelectedEdit(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
