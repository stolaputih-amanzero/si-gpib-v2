'use client';

import Link from 'next/link';
import { useProfileAkun, useProfilePelayanan, usePenugasanPj, useHierarkiInfo } from '@/hooks/use-profile';
import { Network, Building2, Church, MapPin, ExternalLink, ChevronRight } from 'lucide-react';

interface HierarkiPelayananSectionProps {
  userId?: string;
  idPendeta?: string | null;
}

export function HierarkiPelayananSection({ userId, idPendeta }: HierarkiPelayananSectionProps) {
  const { data: akun, isLoading: isAkunLoading } = useProfileAkun(userId);
  const { data: pelayanan, isLoading: isPelayananLoading } = useProfilePelayanan(idPendeta);
  const { data: penugasanPos, isLoading: isPosLoading } = usePenugasanPj(idPendeta);

  const mupelId = akun?.id_mupel;
  const jemaatId = pelayanan?.id_induk || akun?.id_induk;
  const posId = akun?.id_pos;

  const { data: hierarkiInfo } = useHierarkiInfo(mupelId, jemaatId, posId);

  if (isAkunLoading || isPelayananLoading || isPosLoading) {
    return <div className="card-flat p-6 h-64 skeleton" />;
  }

  const mupelNama = pelayanan?.mupel_nama || hierarkiInfo?.mupelNama || (mupelId ? `Mupel (${mupelId})` : 'Musyawarah Pelayanan (Mupel)');
  const jemaatNama = pelayanan?.jemaat_induk_nama || hierarkiInfo?.jemaatNama || (jemaatId ? `Jemaat (${jemaatId})` : 'Jemaat Induk GPIB');

  return (
    <div className="card-flat p-5 space-y-5 bg-surface-1 animate-rise">
      <div className="flex items-center justify-between border-b border-line-hairline pb-3">
        <h3 className="font-display font-semibold text-base text-ink-primary flex items-center gap-2">
          <Network size={18} className="text-brand-600" />
          <span>Hierarki Penugasan Wilayah</span>
        </h3>
        <span className="text-xs text-ink-tertiary">Deep-link Rantai Pelayanan</span>
      </div>

      <div className="max-w-xl mx-auto space-y-0 relative">
        {/* Node 1: Mupel */}
        <Link
          href={mupelId ? `/hierarki/${mupelId}` : '/hierarki'}
          className="card-flat p-4 flex items-center justify-between gap-3 hover:border-brand-500/50 hover:bg-surface-sunken transition-all tap group border-l-4 border-l-purple-500"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">Musyawarah Pelayanan (Mupel)</span>
              <p className="font-semibold text-sm text-ink-primary group-hover:text-purple-600 transition-colors">
                {mupelNama}
              </p>
              {mupelId && <p className="text-[11px] font-mono text-ink-tertiary">ID: {mupelId}</p>}
            </div>
          </div>
          <ChevronRight size={18} className="text-ink-tertiary group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Connector Line 1 */}
        <div className="w-px h-6 bg-line-subtle mx-auto my-0.5" />

        {/* Node 2: Jemaat Induk */}
        <Link
          href={jemaatId && mupelId ? `/hierarki/${mupelId}/${jemaatId}` : '/hierarki'}
          className="card-flat p-4 flex items-center justify-between gap-3 hover:border-brand-500/50 hover:bg-surface-sunken transition-all tap group border-l-4 border-l-blue-500"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <Church size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Jemaat Induk</span>
              <p className="font-semibold text-sm text-ink-primary group-hover:text-blue-600 transition-colors">
                {jemaatNama}
              </p>
              {jemaatId && <p className="text-[11px] font-mono text-ink-tertiary">ID: {jemaatId}</p>}
            </div>
          </div>
          <ChevronRight size={18} className="text-ink-tertiary group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Connector Line 2 */}
        <div className="w-px h-6 bg-line-subtle mx-auto my-0.5" />

        {/* Node 3: Pos Pelkes List */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block text-center">
            Pos Pelkes Dalam Wilayah Penugasan ({penugasanPos?.length || 0})
          </span>

          {penugasanPos && penugasanPos.length > 0 ? (
            penugasanPos.map((pos) => (
              <Link
                key={pos.id_penugasan}
                href={`/dashboard/pos-pelkes/${pos.id_pos}`}
                className="card-flat p-3.5 flex items-center justify-between gap-3 hover:border-brand-500/50 hover:bg-surface-sunken transition-all tap group border-l-4 border-l-emerald-500"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink-primary group-hover:text-emerald-600 transition-colors">
                      {pos.nama_pos || `Pos Pelkes ${pos.id_pos}`}
                    </p>
                    <p className="text-[11px] font-mono text-ink-tertiary">
                      Mulai: {pos.tgl_mulai || 'Aktif'}
                    </p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-ink-tertiary group-hover:text-emerald-600 transition-colors" />
              </Link>
            ))
          ) : (
            <div className="card-flat p-4 text-center border-dashed text-xs text-ink-tertiary">
              Belum ada Pos Pelkes aktif terhubung secara spesifik ke akun ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
