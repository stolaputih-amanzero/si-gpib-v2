'use client';

import { usePendeta360 } from '@/lib/domains/pendeta/pendeta.queries';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStatsStrip } from './ProfileStatsStrip';
import { ProfileSection } from './ProfileSection';
import { KeluargaSection } from './sections/KeluargaSection';
import { KompetensiSection } from './sections/KompetensiSection';
import { KeterlibatanSection } from './sections/KeterlibatanSection';
import { MutasiSection } from './sections/MutasiSection';
import { JabatanSection } from './sections/JabatanSection';
import { BiometricSection } from './sections/BiometricSection';
import { AuditSection } from './sections/AuditSection';
import { PelayananSection } from './sections/PelayananSection';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile360ViewProps {
  idPendeta: string;
}

export function Profile360View({ idPendeta }: Profile360ViewProps) {
  const { data: user } = useCurrentUser();
  const { data: profile, isLoading, error } = usePendeta360(idPendeta);

  if (isLoading) {
    return <Profile360Skeleton />;
  }

  if (error || !profile) {
    return (
      <div className="p-4 text-center text-red-600">
        Gagal memuat profil: {error?.message || 'Data tidak ditemukan'}
      </div>
    );
  }

  const isSuperUser = user?.role === 'super_user';
  const canSeePrivate = isSuperUser || (user as any)?.id_pendeta === idPendeta;

  return (
    <div className="space-y-6 pb-8">
      <ProfileHeader pendeta={profile.pendeta} />
      <ProfileStatsStrip stats={profile.stats} />

      {/* Section 1: Pelayanan (Hierarki) */}
      <ProfileSection title="Pelayanan" icon="church">
        <PelayananSection pendeta={profile.pendeta} jabatan={profile.jabatan || []} />
      </ProfileSection>

      {/* Section 2: Kompetensi & Karunia */}
      <ProfileSection title="Kompetensi & Karunia" icon="award">
        <KompetensiSection data={profile.kompetensi || []} />
      </ProfileSection>

      {/* Section 3: Keterlibatan Sinodal */}
      <ProfileSection title="Keterlibatan Sinodal" icon="users">
        <KeterlibatanSection data={profile.keterlibatan || []} />
      </ProfileSection>

      {/* Section 4: Keluarga (PRIVAT — absen dari DOM jika unauthorized) */}
      {canSeePrivate && profile.keluarga !== null && (
        <ProfileSection title="Keluarga" icon="home">
          <KeluargaSection data={profile.keluarga} />
        </ProfileSection>
      )}

      {/* Section 5: Mutasi */}
      <ProfileSection title="Riwayat Mutasi" icon="arrow-right-left">
        <MutasiSection data={profile.mutasi || []} />
      </ProfileSection>

      {/* Section 6: Jabatan Struktural */}
      <ProfileSection title="Jabatan Struktural" icon="briefcase">
        <JabatanSection data={profile.jabatan || []} />
      </ProfileSection>

      {/* Section 7: Log & Aktivitas */}
      {profile.audit_log !== null && (
        <ProfileSection title="Log & Aktivitas" icon="activity">
          <AuditSection data={profile.audit_log} />
        </ProfileSection>
      )}

      {/* Section 8: Perangkat Biometrik (PRIVAT — absen dari DOM jika unauthorized) */}
      {canSeePrivate && profile.biometric !== null && (
        <ProfileSection title="Perangkat Biometrik" icon="fingerprint">
          <BiometricSection data={profile.biometric} />
        </ProfileSection>
      )}
    </div>
  );
}

function Profile360Skeleton() {
  return (
    <div className="space-y-6 p-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}
