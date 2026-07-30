'use client';

import { useState } from 'react';
import { useProfileAkun } from '@/hooks/use-profile';
import { ProfileHero } from './ProfileHero';
import { ProfileStatStrip } from './ProfileStatStrip';
import { ProfileTabs, ProfileTabKey } from './ProfileTabs';
import { AkunKeamananSection } from './sections/AkunKeamananSection';
import { IdentitasPelayananSection } from './sections/IdentitasPelayananSection';
import { HierarkiPelayananSection } from './sections/HierarkiPelayananSection';
import { PeranPenugasanSection } from './sections/PeranPenugasanSection';
import { RiwayatMutasiSection } from './sections/RiwayatMutasiSection';
import { LogPastoralSection } from './sections/LogPastoralSection';
import { AktivitasSection } from './sections/AktivitasSection';
import { DataLokalSection } from './sections/DataLokalSection';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';

interface ProfileViewProps {
  userId?: string;
  mode?: 'self' | 'supervise';
  onEditProfile?: () => void;
  onChangeRole?: () => void;
  onOpenPasswordModal?: () => void;
  onEditPelayanan?: () => void;
}

export function ProfileView({
  userId,
  mode = 'self',
  onEditProfile,
  onChangeRole,
  onOpenPasswordModal,
  onEditPelayanan,
}: ProfileViewProps) {
  const { data: akun } = useProfileAkun(userId);
  const { data: currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('akun');

  const idPendeta = akun?.id_pendeta || null;
  const isSuperUser = isSuperUserRole(currentUser?.role);
  const isSelf = mode === 'self';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 px-2.5 sm:px-4 md:px-6">
      {/* Hero Header */}
      <ProfileHero
        userId={userId}
        mode={mode}
        onEditProfile={onEditProfile}
        onChangeRole={onChangeRole}
      />

      {/* Dynamic Stat Strip */}
      <ProfileStatStrip userId={userId} idPendeta={idPendeta} />

      {/* Section Tabs */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasPendeta={Boolean(idPendeta)}
      />

      {/* Render Active Section Content */}
      <div className="pt-2">
        {activeTab === 'akun' && (
          <AkunKeamananSection
            userId={userId}
            isSelf={isSelf}
            onOpenPasswordModal={onOpenPasswordModal}
          />
        )}

        {activeTab === 'identitas' && (
          <IdentitasPelayananSection
            idPendeta={idPendeta}
            canEdit={isSuperUser || isSelf}
            onEditPelayanan={onEditPelayanan}
          />
        )}

        {activeTab === 'hierarki' && (
          <HierarkiPelayananSection userId={userId} idPendeta={idPendeta} />
        )}

        {activeTab === 'penugasan' && (
          <PeranPenugasanSection idPendeta={idPendeta} />
        )}

        {activeTab === 'mutasi' && (
          <RiwayatMutasiSection idPendeta={idPendeta} />
        )}

        {activeTab === 'pastoral' && (
          <LogPastoralSection idPendeta={idPendeta} />
        )}

        {activeTab === 'aktivitas' && (
          <AktivitasSection userId={userId} isAuthorized={isSelf || isSuperUser} />
        )}

        {activeTab === 'draft' && (
          <DataLokalSection userId={userId} isSelf={isSelf} />
        )}
      </div>
    </div>
  );
}
