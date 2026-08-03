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
    <div className="space-y-6 pb-28 max-w-4xl mx-auto px-3 sm:px-6 select-none w-full max-w-full overflow-x-hidden">
      {/* 1. ProfileHeader */}
      <ProfileHeader
        user={formattedUser}
        viewerContext={viewerContext}
        onEditProfile={onEditProfile}
        onChangeRole={onChangeRole}
      />

      {/* 2. StatStrip */}
      <SummaryStrip
        metrics={metrics}
        className="bg-surface-1/60 rounded-2xl py-2 px-3 border border-border-subtle shadow-2xs w-full max-w-full overflow-x-auto no-scrollbar"
      />

      {/* 3. Section: Akun & Keamanan */}
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
          value={(akun.role || 'Pelayan').toUpperCase()}
        />
      </section>

      {/* 4. Section: Perangkat Biometrik */}
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
              value={idPendeta}
            />

            <InfoBlock
              icon={<User className="w-4 h-4 text-brand-primary" />}
              label="Jabatan Pelayanan"
              value={pelayanan?.jabatan || (pelayanan?.is_pj ? 'Pendeta Jemaat (PJ)' : pelayanan?.is_kmj ? 'Ketua Majelis Jemaat (KMJ)' : 'Pendeta Organik GPIB')}
            />

            {pelayanan?.tgl_lahir && (
              <InfoBlock
                icon={<Calendar className="w-4 h-4 text-brand-primary" />}
                label="Tanggal Lahir"
                value={pelayanan.tgl_lahir}
              />
            )}

            {(pelayanan?.nip || pelayanan?.nik) && (
              <InfoBlock
                icon={<FileText className="w-4 h-4 text-brand-primary" />}
                label="NIP / NIK Pendeta"
                value={pelayanan.nip || pelayanan.nik}
              />
            )}
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
              value={pelayanan?.nama_induk || 'GPIB Jemaat Induk'}
              href={pelayanan?.id_induk ? `/jemaat/${encodeURIComponent(pelayanan.id_induk)}` : undefined}
            />

            <InfoBlock
              icon={<Building2 className="w-4 h-4 text-brand-primary" />}
              label="Musyawarah Pelayanan (Mupel)"
              value={pelayanan?.nama_mupel || 'Mupel GPIB'}
              href={pelayanan?.id_mupel ? `/mupel/${encodeURIComponent(pelayanan.id_mupel)}` : undefined}
            />

            {pelayanan?.pos_pelkes_nama && (
              <InfoBlock
                icon={<BadgeCheck className="w-4 h-4 text-brand-primary" />}
                label="Pos Pelkes Tugas"
                value={pelayanan.pos_pelkes_nama}
                href={pelayanan?.id_pos ? `/dashboard/pos-pelkes/${encodeURIComponent(pelayanan.id_pos)}` : undefined}
              />
            )}
          </section>

          {/* Section: Riwayat Mutasi (VerticalTimeline) */}
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand-primary" />
              <span>Riwayat Mutasi & Penugasan</span>
            </h2>
            <VerticalTimeline events={mapMutasiToTimeline(mutasiList)} emptyMessage="Belum ada riwayat mutasi tercatat" />
          </section>

          {/* Section: Data Keluarga (PrivacyGuard Ketat) */}
          <KeluargaSection
            idPendeta={idPendeta}
            isOwnerOrSuperUser={viewerContext.canViewPrivate}
          />

          {/* Section: Keterlibatan Sinodal & Pelayanan */}
          <KeterlibatanSection
            idPendeta={idPendeta}
            canEdit={viewerContext.canViewPrivate}
          />

          {/* Section: Kompetensi & Karunia */}
          <KompetensiSection
            idPendeta={idPendeta}
            canEdit={viewerContext.canViewPrivate}
          />
        </>
      ) : (
        /* Graceful Fallback for Non-Pendeta */
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
              meta="Sesi Aktif"
            />
          </div>
        </PrivacyGuard>
      </section>
    </div>
  );
}

export default ProfileView;
