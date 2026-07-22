'use client';

import { useState } from 'react';
import Link from 'next/link';
import { JemaatIndukItem, useDeleteJemaat } from '@/hooks/use-hierarki';
import { Church, ChevronRight, UserCheck, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { SecureDeleteModal } from '@/components/ui/SecureDeleteModal';
import { useToast } from '@/components/ui/toast';

import { useCurrentUser } from '@/hooks/use-current-user';

interface JemaatCardProps {
  jemaat: JemaatIndukItem;
  id_mupel: string;
  onEdit?: (jemaat: JemaatIndukItem) => void;
}

export function JemaatCard({ jemaat, id_mupel, onEdit }: JemaatCardProps) {
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const isSuperUser = currentUser?.isSuperUser ?? false;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const hasKmj = Boolean(jemaat.kmj?.nama_lengkap);
  const hasCoordinates = Boolean(jemaat.latitude && jemaat.longitude);
  const deleteJemaatMutation = useDeleteJemaat();

  const handleConfirmDelete = async () => {
    try {
      await deleteJemaatMutation.mutateAsync(jemaat.id_induk);
      toast.success('Berhasil Dihapus', `Jemaat Induk "${jemaat.nama_induk}" telah dihapus.`);
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error('Gagal Menghapus', err?.message || 'Gagal menghapus Jemaat Induk.');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(jemaat);
  };

  return (
    <Link
      href={`/hierarki/${encodeURIComponent(id_mupel)}/${encodeURIComponent(jemaat.id_induk)}`}
      className="block group min-h-[44px] bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft hover:border-brand-primary/40 hover:shadow-medium transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
            <Church size={22} />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                {jemaat.id_induk}
              </span>

              {/* Status KMJ Badge */}
              {hasKmj ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  <UserCheck size={12} className="text-indigo-600 dark:text-indigo-400" />
                  KMJ: {jemaat.kmj?.nama_lengkap}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                  <AlertCircle size={12} className="text-amber-600 dark:text-amber-400" />
                  Belum ada KMJ
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-text-high text-base group-hover:text-brand-primary transition-colors leading-snug">
              {jemaat.nama_induk}
            </h3>

            {jemaat.alamat && (
              <p className="text-xs text-text-muted line-clamp-1">{jemaat.alamat}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Actions */}
          {onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="p-2 rounded-xl text-text-muted hover:text-brand-primary hover:bg-surface-sunken transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Edit Jemaat Induk"
            >
              <Edit3 size={16} />
            </button>
          )}

          {isSuperUser && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              disabled={deleteJemaatMutation.isPending}
              className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-50"
              title="Hapus Jemaat Induk"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="p-2 rounded-xl text-text-muted group-hover:text-brand-primary group-hover:bg-surface-sunken transition-all shrink-0">
            <ChevronRight size={20} />
          </div>
        </div>

        {/* GPS Indicator */}
        {!hasCoordinates && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
            ⚠️ Koordinat belum diisi
          </span>
        )}
      </div>

      <SecureDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Jemaat Induk"
        targetName={jemaat.nama_induk}
        targetId={jemaat.id_induk}
        itemType="Jemaat Induk"
        isDeleting={deleteJemaatMutation.isPending}
      />
    </Link>
  );
}
