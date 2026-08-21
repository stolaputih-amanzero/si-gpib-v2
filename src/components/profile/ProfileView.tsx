'use client';

import { useProfileAkun, useProfileStats, useProfilePelayanan, useRiwayatMutasi } from '@/hooks/use-profile';
import { useKompetensiPendeta, useKeterlibatanPendeta } from '@/hooks/use-pendeta-360';
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
import { mapMutasiToTimeline } from '@/lib/utils/timeline-adapters';
import { ListSkeleton } from '@/components/list/ListSkeleton';
import { KeluargaSection } from './sections/KeluargaSection';
import { KompetensiSection } from './sections/KompetensiSection';
import { KeterlibatanSection } from './sections/KeterlibatanSection';
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
  Activity,
  UserCheck,
  FileText,
  BadgeCheck,
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
  const { data: pelayanan } = useProfilePelayanan(idPendeta);
  const { data: mutasiList = [] } = useRiwayatMutasi(idPendeta);
  const { data: keterlibatanList = [] } = useKeterlibatanPendeta(idPendeta || undefined);
  const { data: kompetensiList = [] } = useKompetensiPendeta(idPendeta || undefined);

  if (isUserLoading || isAkunLoading) {
    return <ListSkeleton count={4} />;
  }

  if (!akun) {
    return <ListSkeleton count={4} />;
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
    keterlibatan: keterlibatanList.length,
    kompetensi: kompetensiList.length,
    hariBergabung: 365,
    aktivitasBulanIni: 12,
    draftAktif: 0,
  });

  const formattedUser = {
    id: akun.id,
    nama_lengkap: pelayanan?.nama_pendeta || akun.nama_lengkap || 'Pengguna GPIB',
    email: akun.email || '',
    role: akun.role,
    status: akun.status,
    foto_url: pelayanan?.foto_url || akun.foto_url,
    id_pendeta: akun.id_pendeta,
    no_hp: akun.no_hp || akun.no_telepon,
  };

  return (
    <div className="space-y-8 pb-32 max-w-3xl mx-auto px-4 sm:px-6 select-none w-full max-w-full overflow-x-hidden pt-2 sm:pt-4">
      {/* 1. Fluid ProfileHeader */}
      <ProfileHeader
        user={formattedUser}
        viewerContext={viewerContext}
        onEditProfile={onEditProfile}
        onChangeRole={onChangeRole}
      />

      {/* 2. Fluid SummaryStrip */}
      <SummaryStrip
        metrics={metrics}
        className="bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl py-2 px-3 border border-amber-500/15 shadow-2xs w-full max-w-full overflow-x-auto no-scrollbar"
      />

      <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

      {/* 3. Section: Akun & Keamanan (Fluid Key-Value) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
          <Key className="size-4 text-amber-600 dark:text-amber-400" />
          <span>Kredensial &amp; Akun</span>
        </h2>

        <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
          <InfoBlock
            icon={<Mail className="size-4 text-amber-600 dark:text-amber-400" />}
            label="Alamat Email Utama"
            value={akun.email}
          />

          <InfoBlock
            icon={<Phone className="size-4 text-amber-600 dark:text-amber-400" />}
            label="Nomor Telepon / WhatsApp"
            value={akun.no_hp || akun.no_telepon || 'Belum ditautkan'}
            href={akun.no_hp || akun.no_telepon ? `https://wa.me/${(akun.no_hp || akun.no_telepon || '').replace(/[^0-9]/g, '')}` : undefined}
          />

          <InfoBlock
            icon={<Shield className="size-4 text-amber-600 dark:text-amber-400" />}
            label="Role Hak Akses (RBAC)"
            value={(akun.role || 'Pelayan').toUpperCase()}
          />
        </div>
      </section>

      {/* 4. Section: Dimensi Pelayanan Pendeta OR GracefulFallback */}
      {isPendeta ? (
        <>
          <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

          {/* Section: Identitas Pelayanan */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <Crown className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Identitas &amp; Status Pelayanan</span>
            </h2>

            <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
              <InfoBlock
                icon={<Crown className="size-4 text-amber-600 dark:text-amber-400" />}
                label="ID Pendeta GPIB"
                value={idPendeta}
              />

              <InfoBlock
                icon={<User className="size-4 text-amber-600 dark:text-amber-400" />}
                label="Jabatan Pelayanan"
                value={pelayanan?.jabatan || (pelayanan?.is_pj ? 'Pendeta Jemaat (PJ)' : pelayanan?.is_kmj ? 'Ketua Majelis Jemaat (KMJ)' : 'Pendeta Organik GPIB')}
              />

              {pelayanan?.tgl_lahir && (
                <InfoBlock
                  icon={<Calendar className="size-4 text-amber-600 dark:text-amber-400" />}
                  label="Tanggal Lahir"
                  value={pelayanan.tgl_lahir}
                />
              )}

              {(pelayanan?.nip || pelayanan?.nik) && (
                <InfoBlock
                  icon={<FileText className="size-4 text-amber-600 dark:text-amber-400" />}
                  label="NIP / NIK Pendeta"
                  value={pelayanan.nip || pelayanan.nik}
                />
              )}
            </div>
          </section>

          <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

          {/* Section: Hierarki Pelayanan */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <Church className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Hierarki Wilayah Pelayanan</span>
            </h2>

            <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
              <InfoBlock
                icon={<Church className="size-4 text-amber-600 dark:text-amber-400" />}
                label="Jemaat Induk Pengampu"
                value={pelayanan?.nama_induk || 'GPIB Jemaat Induk'}
                href={pelayanan?.id_induk ? `/jemaat/${encodeURIComponent(pelayanan.id_induk)}` : undefined}
              />

              <InfoBlock
                icon={<Building2 className="size-4 text-amber-600 dark:text-amber-400" />}
                label="Musyawarah Pelayanan (Mupel)"
                value={pelayanan?.nama_mupel || 'Mupel GPIB'}
                href={pelayanan?.id_mupel ? `/mupel/${encodeURIComponent(pelayanan.id_mupel)}` : undefined}
              />

              {pelayanan?.pos_pelkes_nama && (
                <InfoBlock
                  icon={<BadgeCheck className="size-4 text-amber-600 dark:text-amber-400" />}
                  label="Pos Pelkes Tugas"
                  value={pelayanan.pos_pelkes_nama}
                  href={pelayanan?.id_pos ? `/dashboard/pos-pelkes/${encodeURIComponent(pelayanan.id_pos)}` : undefined}
                />
              )}
            </div>
          </section>

          <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

          {/* Section: Riwayat Mutasi (VerticalTimeline) */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
              <Activity className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Riwayat Mutasi &amp; Penugasan</span>
            </h2>
            <VerticalTimeline events={mapMutasiToTimeline(mutasiList)} emptyMessage="Belum ada riwayat mutasi tercatat" />
          </section>

          {/* Section: Data Keluarga (PrivacyGuard Ketat) */}
          <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />
          <KeluargaSection
            idPendeta={idPendeta}
            isOwnerOrSuperUser={viewerContext.canViewPrivate}
          />

          {/* Section: Keterlibatan Sinodal & Pelayanan */}
          <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />
          <KeterlibatanSection
            idPendeta={idPendeta}
            canEdit={viewerContext.canViewPrivate}
          />

          {/* Section: Kompetensi & Karunia */}
          <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />
          <KompetensiSection
            idPendeta={idPendeta}
            canEdit={viewerContext.canViewPrivate}
          />
        </>
      ) : (
        /* Graceful Fallback for Non-Pendeta */
        <>
          <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />
          <GracefulFallback />
        </>
      )}

      <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

      {/* 5. Section: Perangkat Biometrik */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
          <Fingerprint className="size-4 text-amber-600 dark:text-amber-400" />
          <span>Perangkat Biometrik WebAuthn</span>
        </h2>

        <PrivacyGuard canAccess={viewerContext.canViewPrivate} sectionName="biometric">
          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
            <ListRow
              icon={<Fingerprint className="size-5 text-emerald-600 dark:text-emerald-400" />}
              iconVariant="accent"
              title="TouchID / Passkey Utama"
              subtitle="Terdaftar pada perangkat ini"
              badge={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Aktif
                </span>
              }
            />
          </div>
        </PrivacyGuard>
      </section>

      <div className="h-px bg-stone-200/80 dark:bg-stone-800/80" />

      {/* 6. Section: Aktivitas Akun (PrivacyGuard Ketat) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary flex items-center gap-1.5">
          <Activity className="size-4 text-amber-600 dark:text-amber-400" />
          <span>Jejak Aktivitas Akun</span>
        </h2>
        <PrivacyGuard canAccess={viewerContext.canViewPrivate} sectionName="aktivitas">
          <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
            <ListRow
              icon={<UserCheck className="size-5 text-emerald-600 dark:text-emerald-400" />}
              iconVariant="accent"
              title="Sesi Login Berhasil"
              subtitle="Mengakses SI GPIB v2.2 Dashboard"
              meta="Sesi Aktif"
            />
          </div>
        </PrivacyGuard>
      </section>
    </div>
  );
}

export default ProfileView;
