'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MupelItem, useDeleteMupel } from '@/hooks/use-hierarki';
import { Layers, Church, MapPin, Trash2 } from 'lucide-react';
import { SecureDeleteModal } from '@/components/ui/SecureDeleteModal';
import { useToast } from '@/components/ui/toast';

import { useCurrentUser } from '@/hooks/use-current-user';

interface MupelCardProps {
  mupel: MupelItem;
  onEdit?: (mupel: MupelItem) => void;
}

export function MupelCard({ mupel }: MupelCardProps) {
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const isSuperUser = currentUser?.isSuperUser ?? false;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteMupelMutation = useDeleteMupel();

  const handleConfirmDelete = async () => {
    try {
      await deleteMupelMutation.mutateAsync(mupel.id_mupel);
      toast.success('Berhasil Dihapus', `Mupel "${mupel.nama_mupel}" telah dihapus.`);
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error('Gagal Menghapus', err?.message || 'Gagal menghapus Mupel.');
    }
  };

  return (
    <Link
      href={`/hierarki/${encodeURIComponent(mupel.id_mupel)}`}
      className="block group min-h-[44px] bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft hover:border-brand-primary/40 hover:shadow-medium transition-all active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
            <Layers size={22} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-sunken border border-border-subtle text-text-muted">
                {mupel.id_mupel}
              </span>
            </div>
            <h3 className="font-extrabold text-text-high text-base group-hover:text-brand-primary transition-colors leading-snug">
              {mupel.nama_mupel}
            </h3>
            {mupel.keterangan && (
              <p className="text-xs text-text-muted line-clamp-1 mt-0.5">{mupel.keterangan}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSuperUser && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              disabled={deleteMupelMutation.isPending}
              className="p-2 rounded-xl text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-50"
              title="Hapus Mupel"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl px-2.5 py-1 text-center">
              <span className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">Jemaat</span>
              <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 tabular-nums">
                {mupel.jemaat_count ?? 0}
              </span>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-2.5 py-1 text-center">
              <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Pos</span>
              <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 tabular-nums">
                {mupel.pos_count ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stat Badges */}
      <div className="flex sm:hidden items-center gap-2 mt-3 pt-3 border-t border-border-subtle text-xs text-text-muted">
        <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
          <Church size={14} />
          {mupel.jemaat_count ?? 0} Jemaat Induk
        </span>
        <span>•</span>
        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
          <MapPin size={14} />
          {mupel.pos_count ?? 0} Pos Pelkes
        </span>
      </div>

      <SecureDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus MUPEL"
        targetName={mupel.nama_mupel}
        targetId={mupel.id_mupel}
        itemType="Musyawarah Pelayanan (MUPEL)"
        isDeleting={deleteMupelMutation.isPending}
      />
    </Link>
  );
}
