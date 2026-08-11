'use client';

import Link from 'next/link';
import { useDraftUser, useDeleteDraft } from '@/hooks/use-profile';
import { HardDrive, Trash2, ArrowRight, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface DataLokalSectionProps {
  userId?: string;
  isSelf?: boolean;
}

export function DataLokalSection({ userId, isSelf = true }: DataLokalSectionProps) {
  const { toast, confirm } = useToast();
  const { data: drafts, isLoading } = useDraftUser(userId);
  const deleteMutation = useDeleteDraft();

  const handleDeleteDraft = (keyName: string, title: string) => {
    confirm({
      title: 'Hapus Draf Lokal',
      message: `Apakah Anda yakin ingin menghapus draf "${title}"? Data yang belum disimpan akan hilang.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(keyName);
          toast.success('Draf Dihapus', `Draf "${title}" berhasil dihapus dari perangkat.`);
        } catch (err: any) {
          toast.error('Gagal Menghapus', err?.message || 'Terjadi kesalahan saat menghapus draf.');
        }
      },
    });
  };

  if (isLoading) {
    return <div className="card-flat p-6 h-48 skeleton" />;
  }

  return (
    <div className="card-flat p-5 space-y-5 bg-surface-1 animate-rise">
      <div className="flex items-center justify-between border-b border-line-hairline pb-3">
        <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
          <HardDrive size={18} className="text-brand-600" />
          <span>Penyimpanan Lokal & Draf PWA</span>
        </h3>
        <span className="text-xs font-mono text-ink-tertiary tnum">
          {drafts?.length || 0} Draf Tersimpan
        </span>
      </div>

      {drafts && drafts.length > 0 ? (
        <div className="space-y-3">
          {drafts.map((draft) => {
            let updatedRelative = draft.updated_at;
            try {
              updatedRelative = formatDistanceToNow(parseISO(draft.updated_at), { addSuffix: true, locale: id });
            } catch {}

            const humanForm = draft.form_type
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <div
                key={draft.id}
                className="p-4 rounded-2xl bg-surface-sunken border border-line-subtle flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-brand-600 shrink-0" />
                    <h4 className="font-semibold text-sm text-ink-primary truncate">
                      Draf Form: {humanForm}
                    </h4>
                  </div>

                  <p className="text-xs text-ink-tertiary flex items-center gap-1 tnum">
                    <Clock size={12} />
                    <span>Terakhir diubah: {updatedRelative}</span>
                  </p>

                  {draft.data_preview && (
                    <p className="text-xs text-ink-secondary truncate bg-surface-1 p-2 rounded-xl border border-line-hairline font-mono mt-1">
                      {draft.data_preview}
                    </p>
                  )}
                </div>

                {isSelf && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(draft.key_name, humanForm)}
                      className="p-2.5 rounded-xl text-bad hover:bg-bad-soft transition-all min-h-[48px] min-w-[48px] flex items-center justify-center"
                      title="Hapus Draf"
                    >
                      <Trash2 size={18} />
                    </button>

                    <Link
                      href={`/dashboard/aktivitas?draft=${encodeURIComponent(draft.key_name)}`}
                      className="btn btn-primary text-xs min-h-[48px]"
                    >
                      <span>Lanjutkan</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-surface-sunken border border-line-subtle text-center text-xs text-ink-tertiary">
          Tidak ada draf form lokal tersimpan pada perangkat ini saat ini.
        </div>
      )}

      {/* Local PWA Sync Info */}
      <div className="p-3.5 rounded-2xl bg-surface-sunken border border-line-subtle flex items-center justify-between text-xs">
        <span className="text-ink-secondary">Status Sinkronisasi PWA Offline Storage</span>
        <span className="inline-flex items-center gap-1 font-bold text-ok">
          <CheckCircle2 size={14} /> Terhubung (Auto-Sync)
        </span>
      </div>
    </div>
  );
}
