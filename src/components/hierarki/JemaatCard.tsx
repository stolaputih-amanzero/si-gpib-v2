'use client';

import { useState } from 'react';
import Link from 'next/link';
import { JemaatIndukItem, useDeleteJemaat } from '@/hooks/use-hierarki';
import { Church, UserCheck, AlertCircle, Trash2 } from 'lucide-react';
import { SecureDeleteModal } from '@/components/ui/SecureDeleteModal';
import { useToast } from '@/components/ui/toast';

import { useCurrentUser } from '@/hooks/use-current-user';

interface JemaatCardProps {
  jemaat: JemaatIndukItem;
  id_mupel: string;
  onEdit?: (jemaat: JemaatIndukItem) => void;
}

export function JemaatCard({ jemaat, id_mupel }: JemaatCardProps) {
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
            {/* Baris 1: Keterangan */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted shrink-0">
                {jemaat.id_induk}
              </span>
              <span className="text-xs text-text-muted line-clamp-1">
                {jemaat.keterangan || '-'}
              </span>
            </div>

            {/* Baris 2: Nama Jemaat */}
            <h3 className="font-extrabold text-text-high text-base group-hover:text-brand-primary transition-colors leading-snug">
              {jemaat.nama_induk}
            </h3>

            {/* Baris 3: Nama KMJ */}
            <div className="pt-0.5">
              {hasKmj ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  <UserCheck size={12} className="text-indigo-600 dark:text-indigo-400" />
                  KMJ: {jemaat.kmj?.nama_lengkap}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  <AlertCircle size={12} className="text-amber-600 dark:text-amber-400" />
                  KMJ: Belum ada KMJ
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
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
