'use client';

import { useProfilePelayanan } from '@/hooks/use-profile';
import { UserCheck, Award, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentitasPelayananSectionProps {
  idPendeta?: string | null;
  canEdit?: boolean;
  onEditPelayanan?: () => void;
}

export function IdentitasPelayananSection({ idPendeta, canEdit = false, onEditPelayanan }: IdentitasPelayananSectionProps) {
  const { data: pelayanan, isLoading } = useProfilePelayanan(idPendeta);

  if (!idPendeta) {
    return (
      <div className="card-flat p-8 text-center space-y-3 bg-surface-1 border border-line-subtle animate-rise">
        <div className="w-12 h-12 rounded-2xl bg-surface-accent text-accent-600 mx-auto flex items-center justify-center border border-accent-500/20">
          <UserCheck size={24} />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-display font-semibold text-base text-ink-primary">Identitas Pelayanan Khusus Pendeta</h3>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Pengguna ini terdaftar sebagai **Pelayan Field / Administrator non-Pendeta**. Data penugasan Pendeta GPIB tidak terikat secara struktural pada akun ini.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="card-flat p-6 h-64 skeleton" />;
  }

  return (
    <div className="card-flat p-5 space-y-5 bg-surface-1 animate-rise">
      <div className="flex items-center justify-between border-b border-line-hairline pb-3">
        <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
          <Award size={18} className="text-brand-600" />
          <span>Identitas Pelayanan Pendeta GPIB</span>
        </h3>

        {canEdit && onEditPelayanan && (
          <button
            type="button"
            onClick={onEditPelayanan}
            className="btn btn-ghost text-xs min-h-[44px]"
          >
            <Edit size={16} />
            <span>Edit Identitas</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
        <div>
          <span className="text-ink-tertiary font-medium block">Nama Lengkap & Gelar</span>
          <span className="font-semibold text-ink-primary mt-0.5 block">
            {pelayanan?.gelar_depan ? `${pelayanan.gelar_depan} ` : ''}
            {pelayanan?.nama_pendeta}
            {pelayanan?.gelar_belakang ? `, ${pelayanan.gelar_belakang}` : ''}
          </span>
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">NIP / NIK</span>
          <span className="font-mono font-medium text-ink-primary mt-0.5 block">
            NIP: {pelayanan?.nip || '-'} | NIK: {pelayanan?.nik || '-'}
          </span>
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Tempat / Tanggal Lahir</span>
          <span className="font-medium text-ink-primary mt-0.5 block tnum">
            {pelayanan?.tempat_lahir || '-'}, {pelayanan?.tgl_lahir || '-'}
          </span>
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Jenis Kelamin</span>
          <span className="font-medium text-ink-primary mt-0.5 block">
            {pelayanan?.jenis_kelamin === 'L' ? 'Laki-Laki' : pelayanan?.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
          </span>
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Mulai Penugasan GPIB</span>
          <span className="font-mono font-medium text-ink-primary mt-0.5 block tnum">
            {pelayanan?.tgl_tugas_awal || '-'}
          </span>
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Jemaat Induk Utama</span>
          <span className="font-semibold text-brand-600 mt-0.5 block">
            {pelayanan?.jemaat_induk_nama || '-'}
          </span>
        </div>
      </div>

      {/* Role Switches / Status Badges */}
      <div className="pt-3 border-t border-line-hairline grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-surface-sunken border border-line-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-primary">Ketua Majelis Jemaat (KMJ)</p>
            <p className="text-[11px] text-ink-tertiary">Penanggung Jawab Utama Jemaat Induk</p>
          </div>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-bold shrink-0',
              pelayanan?.is_kmj ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-surface-1 text-ink-disabled border border-line-hairline'
            )}
          >
            {pelayanan?.is_kmj ? 'KMJ Aktif' : 'Bukan KMJ'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-sunken border border-line-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-primary">Pendeta Jemaat (PJ)</p>
            <p className="text-[11px] text-ink-tertiary">Pendeta Jemaat Organik GPIB</p>
          </div>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-bold shrink-0',
              pelayanan?.is_pj ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-surface-1 text-ink-disabled border border-line-hairline'
            )}
          >
            {pelayanan?.is_pj ? 'PJ Aktif' : 'Bukan PJ'}
          </span>
        </div>
      </div>
    </div>
  );
}
