'use client';

import { useProfileAkun, useProfileStats } from '@/hooks/use-profile';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ProfileHeader } from './ProfileHeader';
import { SummaryStrip } from '@/components/list/SummaryStrip';
import { InfoBlock } from '@/components/detail/InfoBlock';
import { ListRow } from '@/components/list/ListRow';
import { PrivacyGuard } from './PrivacyGuard';
import { GracefulFallback } from './GracefulFallback';
import { VerticalTimeline } from './VerticalTimeline';
import { getProfileMetrics } from '@/lib/utils/profile-metrics';
import { calculateViewerContext } from '@/lib/utils/privacy-guard';
import { mapMutasiToTimeline, mapKeterlibatanToTimeline } from '@/lib/utils/timeline-adapters';
import { calculateAge } from '@/lib/utils/age-calculator';
import { ContextualFab } from '@/components/detail/ContextualFab';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import {
  User,
  Shield,
  Key,
  Fingerprint,
  Crown,
  Church,
  Building2,
  Calendar,
  Phone,
  Mail,
  Heart,
  Users,
  Briefcase,
  Activity,
  UserCheck,
} from 'lucide-react';

export interface ProfileViewProps {
  userId?: string;
  mode?: 'self' | 'supervise';
  onEditProfile?: () => void;
  onChangeRole?: () => void;
  onOpenPasswordModal?: () => void;
  onEditPelayanan?: () => void;
}

export function ProfileView({
  userId,
  onEditProfile,
  onChangeRole,
}: ProfileViewProps) {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const targetUserId = userId || currentUser?.id;
  const { data: akun, isLoading: isAkunLoading } = useProfileAkun(targetUserId);
  const idPendeta = akun?.id_pendeta || null;
  const { data: statsData } = useProfileStats(idPendeta, targetUserId);

  if (isUserLoading || isAkunLoading) {
    return <ListSkeleton count={4} />;
  }

  if (!akun) {
    return null;
  }

  // Calculate ViewerContext (Hybrid Server/Client Context)
  const viewerContext = calculateViewerContext(
    currentUser?.id,
    akun.id,
    currentUser?.role,
    currentUser?.id_mupel,
    akun.id_mupel
  );

  const isPendeta = Boolean(idPendeta);

  // 6 or 3 Metrics for SummaryStrip
  const metrics = getProfileMetrics(isPendeta, {
    tahunMelayani: Math.floor((statsData?.lama_melayani_bulan || 0) / 12),
    posAktif: statsData?.pos_aktif || 1,
    logBulanIni: statsData?.log_bulan_ini || 0,
    jiwaDilayani: statsData?.total_jiwa || 0,
    keterlibatan: (akun.keterlibatan || []).length,
    kompetensi: (akun.kompetensi || []).length,
    hariBergabung: 365,
    aktivitasBulanIni: 12,
    draftAktif: 0,
  });

  const formattedUser = {
    id: akun.id,
    nama_lengkap: akun.nama_lengkap || 'Pengguna GPIB',
    email: akun.email || '',
    role: akun.role,
    status: akun.status,
    foto_url: akun.foto_url,
    id_pendeta: akun.id_pendeta,
    no_hp: akun.no_hp || akun.no_telepon,
  };

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto px-3 sm:px-6 select-none">
      {/* 1. ProfileHeader (100% Without Map) */}
      <ProfileHeader
        user={formattedUser}
        viewerContext={viewerContext}
        onEditProfile={onEditProfile}
        onChangeRole={onChangeRole}
      />

      {/* 2. StatStrip (6/3 Conditional SummaryStrip Metrics - 100% REUSE) */}
      <SummaryStrip
        metrics={metrics}
        className="bg-surface-1/60 rounded-2xl py-2 px-3 border border-border-subtle shadow-2xs flex-wrap"
      />

      {/* 3. Section: Akun & Keamanan (Hairline InfoBlocks - 100% REUSE) */}
      <section className="bg-surface-1 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden divide-y divide-line-hairline">
        <div className="px-4 py-3 bg-surface-sunken/40">
          <h2 className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Key className="w-4 h-4 text-brand-primary" />
            <span>Akun & Keamanan</span>
          </h2>
        </div>

        <InfoBlock
          icon={<Mail className="w-4 h-4 text-brand-primary" />}
          label="Alamat Email Utama"
          value={akun.email}
        />

        <InfoBlock
          icon={<Phone className="w-4 h-4 text-brand-primary" />}
          label="Nomor Telepon / WhatsApp"
          value={akun.no_hp || akun.no_telepon}
          href={akun.no_hp || akun.no_telepon ? `https://wa.me/${(akun.no_hp || akun.no_telepon || '').replace(/[^0-9]/g, '')}` : undefined}
        />

        <InfoBlock
          icon={<Shield className="w-4 h-4 text-brand-primary" />}
          label="Role Hak Akses (RBAC)"
          value={akun.role || 'Pelayan Field'}
        />
      </section>

      {/* 4. Section: Perangkat Biometrik (PrivacyGuard Ketat) */}
      <section className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
          <Fingerprint className="w-4 h-4 text-brand-primary" />
          <span>Perangkat Biometrik WebAuthn</span>
        </h2>

        <PrivacyGuard canAccess={viewerContext.canViewPrivate} sectionName="biometric">
          <div className="bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs divide-y divide-line-hairline">
            <ListRow
              icon={<Fingerprint className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              iconVariant="accent"
              title="TouchID / Passkey Utama"
              subtitle="Terdaftar pada perangkat ini"
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Aktif
                </span>
              }
            />
          </div>
        </PrivacyGuard>
      </section>

      {/* 5. Section: Dimensi Pelayanan Pendeta OR GracefulFallback */}
      {isPendeta ? (
        <>
          {/* Section: Identitas Pelayanan */}
          <section className="bg-surface-1 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden divide-y divide-line-hairline">
            <div className="px-4 py-3 bg-surface-sunken/40">
              <h2 className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-brand-primary" />
                <span>Identitas & Status Pelayanan</span>
              </h2>
            </div>

            <InfoBlock
              icon={<Crown className="w-4 h-4 text-brand-primary" />}
              label="ID Pendeta GPIB"
              value={akun.id_pendeta}
            />

            <InfoBlock
              icon={<User className="w-4 h-4 text-brand-primary" />}
              label="Jabatan Pelayanan"
              value={akun.pendeta?.jabatan || 'Pendeta GPIB'}
            />

            <InfoBlock
              icon={<Calendar className="w-4 h-4 text-brand-primary" />}
              label="Tanggal Lahir"
              value={akun.pendeta?.tgl_lahir}
            />
          </section>

          {/* Section: Hierarki Pelayanan */}
          <section className="bg-surface-1 rounded-2xl border border-border-subtle shadow-2xs overflow-hidden divide-y divide-line-hairline">
            <div className="px-4 py-3 bg-surface-sunken/40">
              <h2 className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Church className="w-4 h-4 text-brand-primary" />
                <span>Hierarki Wilayah Pelayanan</span>
              </h2>
            </div>

            <InfoBlock
              icon={<Church className="w-4 h-4 text-brand-primary" />}
              label="Jemaat Induk Pengampu"
              value={akun.jemaat?.nama_induk}
              href={akun.id_induk ? `/jemaat/${encodeURIComponent(akun.id_induk)}` : undefined}
            />

            <InfoBlock
              icon={<Building2 className="w-4 h-4 text-brand-primary" />}
              label="Musyawarah Pelayanan (Mupel)"
              value={akun.mupel?.nama_mupel}
              href={akun.id_mupel ? `/mupel/${encodeURIComponent(akun.id_mupel)}` : undefined}
            />
          </section>

          {/* Section: Riwayat Mutasi (VerticalTimeline) */}
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand-primary" />
              <span>Riwayat Mutasi & Penugasan</span>
            </h2>
            <VerticalTimeline events={mapMutasiToTimeline(akun.mutasi || [])} />
          </section>

          {/* Section: Data Keluarga (PrivacyGuard Ketat) */}
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-brand-primary" />
              <span>Anggota Keluarga Pendeta</span>
            </h2>
            <PrivacyGuard canAccess={viewerContext.canViewPrivate} sectionName="keluarga">
              {!akun.keluarga || akun.keluarga.length === 0 ? (
                <div className="p-4 rounded-2xl bg-surface-sunken/40 text-xs text-text-tertiary italic text-center border border-border-subtle">
                  Belum ada data anggota keluarga tercatat.
                </div>
              ) : (
                <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
                  {akun.keluarga.map((k: any) => {
                    const age = calculateAge(k.tgl_lahir);
                    return (
                      <ListRow
                        key={k.id_keluarga || String(Math.random())}
                        icon={<Users className="w-5 h-5 text-brand-primary" />}
                        iconVariant="brand"
                        title={k.nama}
                        subtitle={`Hubungan: ${k.hubungan || 'Keluarga'}`}
                        meta={age ? `Umur: ${age} Tahun` : undefined}
                        badge={
                          k.is_tanggungan ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                              Tanggungan
                            </span>
                          ) : undefined
                        }
                      />
                    );
                  })}
                </div>
              )}
            </PrivacyGuard>
          </section>

          {/* Section: Keterlibatan Sinodal (VerticalTimeline) */}
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-brand-primary" />
              <span>Keterlibatan Pelayanan & Sinodal</span>
            </h2>
            <VerticalTimeline events={mapKeterlibatanToTimeline(akun.keterlibatan || [])} />
          </section>
        </>
      ) : (
        /* Graceful Fallback for Non-Pendeta (Business Rule #21) */
        <GracefulFallback />
      )}

      {/* 6. Section: Aktivitas Akun (PrivacyGuard Ketat) */}
      <section className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-brand-primary" />
          <span>Jejak Aktivitas Akun</span>
        </h2>
        <PrivacyGuard canAccess={viewerContext.canViewPrivate} sectionName="aktivitas">
          <div className="divide-y divide-line-hairline bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
            <ListRow
              icon={<UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              iconVariant="accent"
              title="Sesi Login Berhasil"
              subtitle="Mengakses SI GPIB v2.2 Dashboard"
              meta="Hari ini, 02:29 WIB"
            />
          </div>
        </PrivacyGuard>
      </section>

      {/* 7. Contextual Floating Action Button */}
      <ContextualFab id_pos={akun.id} activeTab="profil" canWrite={viewerContext.isSelf} />
    </div>
  );
}

export default ProfileView;
