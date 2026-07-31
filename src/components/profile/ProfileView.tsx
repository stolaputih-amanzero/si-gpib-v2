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
import { KeluargaSection } from './sections/KeluargaSection';
import { KompetensiSection } from './sections/KompetensiSection';
import { KeterlibatanSection } from './sections/KeterlibatanSection';
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
  const { data: currentUser } = useCurrentUser();
  const targetUserId = userId || currentUser?.id;
  const { data: akun } = useProfileAkun(targetUserId);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('identitas');

  const idPendeta = akun?.id_pendeta || null;
  const isSuperUser = isSuperUserRole(currentUser?.role);
  const isSelf = mode === 'self';
  const isAdminMupel = currentUser?.role === 'admin_mupel' || isSuperUser;

  // Security & RLS checks
  const isOwnerOrSuperUser = isSelf || isSuperUser;
  const canEditDimensions = isSelf || isSuperUser || isAdminMupel;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 px-2.5 sm:px-4 md:px-6">
      {/* Hero Header */}
      <ProfileHero
        userId={targetUserId}
        mode={mode}
        onEditProfile={onEditProfile}
        onChangeRole={onChangeRole}
      />

      {/* Dynamic Stat Strip */}
      <ProfileStatStrip userId={targetUserId} idPendeta={idPendeta} />

      {/* Reorganized Section Tabs (Grouped into Pribadi, Pelayanan, Sistem) */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasPendeta={Boolean(idPendeta)}
      />

      {/* Render Active Section Content */}
      <div className="pt-2">
        {/* GRUP PRIBADI */}
        {activeTab === 'identitas' && (
          <IdentitasPelayananSection
            idPendeta={idPendeta}
            canEdit={isSuperUser || isSelf}
            onEditPelayanan={onEditPelayanan}
          />
        )}

        {activeTab === 'keluarga' && (
          <KeluargaSection
            idPendeta={idPendeta}
            isOwnerOrSuperUser={isOwnerOrSuperUser}
          />
        )}

        {activeTab === 'kompetensi' && (
          <KompetensiSection
            idPendeta={idPendeta}
            canEdit={canEditDimensions}
          />
        )}

        {/* GRUP PELAYANAN */}
        {activeTab === 'hierarki' && (
          <HierarkiPelayananSection userId={targetUserId} idPendeta={idPendeta} />
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

        {activeTab === 'keterlibatan' && (
          <KeterlibatanSection
            idPendeta={idPendeta}
            canEdit={canEditDimensions}
          />
        )}

        {/* GRUP SISTEM */}
        {activeTab === 'akun' && (
          <AkunKeamananSection
            userId={targetUserId}
            isSelf={isSelf}
            onOpenPasswordModal={onOpenPasswordModal}
          />
        )}

        {activeTab === 'aktivitas' && (
          <AktivitasSection userId={targetUserId} isAuthorized={isSelf || isSuperUser} />
        )}

        {activeTab === 'draft' && (
          <DataLokalSection userId={targetUserId} isSelf={isSelf} />
        )}
      </div>
    </div>
  );
}
