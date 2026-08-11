'use client';

import Link from 'next/link';
import { useProfilePelayanan, usePenugasanPj } from '@/hooks/use-profile';
import { Briefcase, Crown, Shield, MapPin, ExternalLink, Calendar } from 'lucide-react';

interface PeranPenugasanSectionProps {
  idPendeta?: string | null;
}

export function PeranPenugasanSection({ idPendeta }: PeranPenugasanSectionProps) {
  const { data: pelayanan, isLoading: isPelayananLoading } = useProfilePelayanan(idPendeta);
  const { data: penugasanList, isLoading: isPenugasanLoading } = usePenugasanPj(idPendeta);

  if (!idPendeta) {
    return (
      <div className="card-flat p-8 text-center space-y-2 bg-surface-1 border border-line-subtle animate-rise">
        <Briefcase size={32} className="mx-auto text-ink-tertiary opacity-40" />
        <p className="font-semibold text-sm text-ink-primary">Penugasan Struktural Pendeta</p>
        <p className="text-xs text-ink-tertiary">
          Pengguna ini bukan merupakan Pendeta GPIB yang terdaftar dalam penugasan KMJ/PJ.
        </p>
      </div>
    );
  }

  if (isPelayananLoading || isPenugasanLoading) {
    return <div className="card-flat p-6 h-48 skeleton" />;
  }

  const activePenugasan = penugasanList?.filter((p) => p.status_aktif) || [];

  return (
    <div className="space-y-4 animate-rise">
      {/* Role KMJ Block */}
      {pelayanan?.is_kmj && (
        <div className="card-flat p-5 bg-purple-500/5 border border-purple-500/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-600 shrink-0">
              <Crown size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Penugasan Aktif</span>
              <h3 className="font-display font-semibold text-base text-ink-primary">Ketua Majelis Jemaat (KMJ)</h3>
            </div>
          </div>

          <p className="text-xs text-ink-secondary leading-relaxed">
            Menjabat sebagai KMJ di <strong>{pelayanan.jemaat_induk_nama || 'Jemaat Induk'}</strong> dengan wewenang pengawasan operasional dan pastoral jemaat.
          </p>

          {pelayanan.id_induk && (
            <Link
              href={`/org/${encodeURIComponent(pelayanan.id_induk)}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline pt-1"
            >
              <span>Lihat Halaman Jemaat Induk</span>
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
      )}

      {/* Role PJ Block & Pos Penugasan */}
      <div className="card-flat p-5 space-y-4 bg-surface-1">
        <div className="flex items-center justify-between border-b border-line-hairline pb-3">
          <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            <span>Penugasan Pendeta Jemaat / PJ Pos Pelkes</span>
          </h3>
          <span className="text-xs font-mono text-ink-tertiary tnum">
            {activePenugasan.length} Pos Aktif
          </span>
        </div>

        {activePenugasan.length > 0 ? (
          <div className="space-y-3">
            {activePenugasan.map((p) => (
              <div
                key={p.id_penugasan}
                className="p-4 rounded-2xl bg-surface-sunken border border-line-subtle flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600 shrink-0" />
                    <h4 className="font-semibold text-sm text-ink-primary">
                      {p.nama_pos || `Pos Pelkes ${p.id_pos}`}
                    </h4>
                  </div>
                  <p className="text-xs text-ink-tertiary flex items-center gap-1 tnum">
                    <Calendar size={12} />
                    <span>Sejak {p.tgl_mulai || 'Penugasan Awal'}</span>
                  </p>
                </div>

                <Link
                  href={`/org/${encodeURIComponent(p.id_pos)}`}
                  className="btn btn-ghost text-xs min-h-[44px] shrink-0"
                >
                  <span>Buka Pos</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-surface-sunken border border-line-subtle text-center text-xs text-ink-tertiary">
            Tidak ada penugasan PJ Pos Pelkes aktif saat ini.
          </div>
        )}
      </div>
    </div>
  );
}
