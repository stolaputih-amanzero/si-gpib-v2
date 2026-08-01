'use client';

import Link from 'next/link';
import { useProfilePelayanan } from '@/hooks/use-profile';
import { UserCheck, Award, Edit, Phone, ExternalLink } from 'lucide-react';
import { formatWhatsAppUrl } from '@/lib/utils';
import { differenceInYears } from 'date-fns';

interface IdentitasPelayananSectionProps {
  idPendeta?: string | null;
  canEdit?: boolean;
  onEditPelayanan?: () => void;
}

export function IdentitasPelayananSection({ idPendeta, canEdit = false, onEditPelayanan }: IdentitasPelayananSectionProps) {
  const { data: pelayanan, isLoading } = useProfilePelayanan(idPendeta);

  const age = pelayanan?.tgl_lahir ? differenceInYears(new Date(), new Date(pelayanan.tgl_lahir)) : null;

  if (!idPendeta) {
    return (
      <div className="p-6 sm:p-8 text-center space-y-3 bg-surface-1/70 backdrop-blur-md border border-line-subtle/40 rounded-3xl animate-rise">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
          <UserCheck size={24} />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-display font-semibold text-base text-ink-primary">Identitas Pelayanan Khusus Pendeta</h3>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Pengguna ini terdaftar sebagai <strong className="font-semibold text-ink-primary">Pelayan Field / Administrator non-Pendeta</strong>. Data penugasan Pendeta GPIB tidak terikat secara struktural pada akun ini.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6 h-64 skeleton rounded-3xl" />;
  }

  return (
    <div className="p-5 sm:p-7 space-y-6 bg-surface-1/70 backdrop-blur-md border border-line-subtle/50 rounded-3xl shadow-xs animate-rise">
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
          <span className="text-ink-tertiary font-medium block">Tempat / Tanggal Lahir & Usia</span>
          <span className="font-medium text-ink-primary mt-0.5 block tnum font-mono">
            {pelayanan?.tempat_lahir ? `${pelayanan.tempat_lahir}, ` : ''}
            {pelayanan?.tgl_lahir
              ? new Date(pelayanan.tgl_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : '-'}
            {age !== null && (
              <span className="font-sans font-semibold text-brand-600 dark:text-brand-400 ml-1">
                ({age} tahun)
              </span>
            )}
          </span>
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Jenis Kelamin</span>
          <span className="font-medium text-ink-primary mt-0.5 block">
            {pelayanan?.jenis_kelamin
              ? pelayanan.jenis_kelamin.toLowerCase().startsWith('l')
                ? 'Laki-Laki'
                : pelayanan.jenis_kelamin.toLowerCase().startsWith('p')
                ? 'Perempuan'
                : pelayanan.jenis_kelamin
              : '-'}
          </span>
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Mulai Penugasan GPIB</span>
          <span className="font-mono font-medium text-ink-primary mt-0.5 block tnum">
            {pelayanan?.tgl_tugas_awal
              ? new Date(pelayanan.tgl_tugas_awal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : '-'}
          </span>
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Nomor Telepon / WhatsApp</span>
          {pelayanan?.no_telepon ? (
            <a
              href={formatWhatsAppUrl(pelayanan.no_telepon) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 inline-flex items-center gap-1.5"
              title="Hubungi via WhatsApp"
            >
              <Phone size={14} />
              <span>{pelayanan.no_telepon}</span>
              <ExternalLink size={12} className="opacity-75" />
            </a>
          ) : (
            <span className="font-mono text-ink-tertiary mt-0.5 block">-</span>
          )}
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Mupel</span>
          {pelayanan?.mupel_nama ? (
            <Link
              href={
                pelayanan.id_mupel
                  ? `/hierarki/${encodeURIComponent(pelayanan.id_mupel)}`
                  : `/hierarki?search=${encodeURIComponent(pelayanan.mupel_nama.replace(/^Mupel\s+/i, ''))}`
              }
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-0.5 inline-flex items-center gap-1 group"
              title={`Lihat Detail Mupel ${pelayanan.mupel_nama}`}
            >
              <span>{pelayanan.mupel_nama.replace(/^Mupel\s+/i, '')}</span>
              <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          ) : (
            <span className="font-semibold text-ink-tertiary mt-0.5 block">-</span>
          )}
        </div>

        <div>
          <span className="text-ink-tertiary font-medium block">Jemaat Induk</span>
          {pelayanan?.jemaat_induk_nama ? (
            <Link
              href={
                pelayanan.id_induk
                  ? `/hierarki/${encodeURIComponent(pelayanan.id_mupel || 'all')}/${encodeURIComponent(pelayanan.id_induk)}`
                  : `/hierarki?search=${encodeURIComponent(pelayanan.jemaat_induk_nama)}`
              }
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-0.5 inline-flex items-center gap-1 group"
              title={`Lihat Detail Jemaat Induk ${pelayanan.jemaat_induk_nama}`}
            >
              <span>{pelayanan.jemaat_induk_nama}</span>
              <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          ) : (
            <span className="font-semibold text-ink-tertiary mt-0.5 block">-</span>
          )}
        </div>

        {pelayanan?.pos_pelkes_nama && (
          <div>
            <span className="text-ink-tertiary font-medium block">Pos Pelkes / Bajem Penugasan</span>
            <Link
              href={
                pelayanan.id_pos
                  ? `/dashboard/pos-pelkes/${encodeURIComponent(pelayanan.id_pos)}`
                  : '/dashboard/pos-pelkes'
              }
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 inline-flex items-center gap-1 group"
              title={`Lihat Detail Pos Pelkes ${pelayanan.pos_pelkes_nama}`}
            >
              <span>{pelayanan.pos_pelkes_nama}</span>
              <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        )}
      </div>

      {/* Active Role Badges / Status Cards */}
      {(pelayanan?.is_kmj || pelayanan?.is_pj) && (
        <div className="pt-3 border-t border-line-hairline grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pelayanan?.is_kmj && (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">Ketua Majelis Jemaat (KMJ)</p>
                <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80">Penanggung Jawab Utama Jemaat Induk</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 bg-purple-600 text-white">
                KMJ Aktif
              </span>
            </div>
          )}

          {pelayanan?.is_pj && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Pendeta Jemaat (PJ)</p>
                <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80">Pendeta Jemaat Organik GPIB</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 bg-blue-600 text-white">
                PJ Aktif
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
