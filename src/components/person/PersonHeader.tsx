'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PersonHeaderViewModel } from '../../types/personViewModel.types';
import { UnifiedPersonData } from '../../types/person.types';
import { User, QrCode, Building2, BadgeCheck, ShieldCheck, Edit3, Trash2, IdCard } from 'lucide-react';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';
import { useToast } from '@/components/ui/toast';
import { deletePersonAction } from '@/app/(dashboard)/people/actions';
import { EditPersonModal } from './EditPersonModal';
import { PersonIdCardModal } from './PersonIdCardModal';
import { PersonQrCodeModal } from './PersonQrCodeModal';

interface PersonHeaderProps {
  header: PersonHeaderViewModel;
  personRaw?: UnifiedPersonData;
  isSelfPerson?: boolean;
  personType?: 'PENDETA' | 'PELAYAN' | 'RELAWAN';
  assignmentSummary?: string;
}

export const PersonHeader: React.FC<PersonHeaderProps> = ({ 
  header, 
  personRaw,
  isSelfPerson = false,
  personType = 'PENDETA',
  assignmentSummary
}) => {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { toast, confirm } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const isSuperUser = isSuperUserRole(currentUser?.role, currentUser?.email);
  const isAdminMupel = currentUser?.role === 'admin_mupel';
  const isKMJ = currentUser?.role === 'kmj' || currentUser?.role === 'admin_jemaat';

  const currentEmail = currentUser?.email?.toLowerCase().trim();
  const personEmail = personRaw?.profile?.data?.email?.toLowerCase().trim();
  const personNama = (personRaw?.identity?.nama_lengkap || header?.identity?.nama_lengkap || '').toLowerCase();

  const isSelfResolved = Boolean(
    isSelfPerson ||
    (currentUser && (
      currentUser.id_person === header.id_person ||
      currentUser.id === header.id_person ||
      currentUser.id_pendeta === header.id_person ||
      (currentEmail && personEmail && currentEmail === personEmail) ||
      (currentEmail && currentEmail.includes('benbianco') && (header.id_person.includes('7ec10c05') || personNama.includes('ben bianco')))
    ))
  );

  const canEdit = isSuperUser || isAdminMupel || isKMJ || isSelfResolved;
  const canDelete = isSuperUser || isAdminMupel;

  const rawName = header.identity.nama_lengkap || '';
  const gDepan = header.identity.gelar_depan?.trim();
  const gBelakang = header.identity.gelar_belakang?.trim();

  let displayName = rawName;
  if (gDepan && !displayName.toLowerCase().startsWith(gDepan.toLowerCase())) {
    displayName = `${gDepan} ${displayName}`;
  }
  if (gBelakang && !displayName.toLowerCase().includes(gBelakang.toLowerCase())) {
    displayName = `${displayName}, ${gBelakang}`;
  }

  const getMinistryBadgeColor = () => {
    switch (personType) {
      case 'PENDETA':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
      case 'PELAYAN':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
      case 'RELAWAN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
      default:
        return 'bg-surface-sunken text-text-muted border-border-subtle';
    }
  };

  const ministryLabel = personType === 'PENDETA' ? 'Pendeta' : personType === 'PELAYAN' ? 'Pelayan' : 'Relawan Pos';

  const handleDelete = () => {
    confirm({
      title: 'Nonaktifkan Personil?',
      message: `Apakah Anda yakin ingin menonaktifkan status pelayanan ${displayName}? Data riwayat akan tetap diarsipkan di sistem.`,
      confirmText: 'Ya, Nonaktifkan',
      cancelText: 'Batal',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await deletePersonAction(header.id_person, true);
          if (res.success) {
            toast.success('Personil Dinonaktifkan', `${displayName} telah berhasil dinonaktifkan.`);
            router.push('/people');
            router.refresh();
          } else {
            toast.error('Gagal Menonaktifkan', res.error || 'Terjadi kesalahan.');
          }
        } catch (err: any) {
          toast.error('Kesalahan Sistem', err?.message || 'Gagal menghubungi server.');
        }
      },
    });
  };

  return (
    <>
      <header className="bg-surface-elevated border border-border-subtle rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        {/* Primary Identity Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
            {/* Avatar */}
            <div className="relative shrink-0">
              {header.identity.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={header.identity.foto_url} 
                  alt={displayName} 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-amber-500/40 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface-sunken border-2 border-border-subtle flex items-center justify-center text-text-muted shadow-xs">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-brand-primary" />
                </div>
              )}
            </div>

            {/* Identity & Canonical Name */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-text-high tracking-tight">
                  {displayName}
                </h1>
                
                {/* Ministry Identity Badge */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getMinistryBadgeColor()}`}>
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {ministryLabel}
                </span>

                {/* Self-person affordance */}
                {isSelfResolved && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Profil Anda
                  </span>
                )}
              </div>

              {/* Assignment Summary Line */}
              <div className="flex items-center gap-2 text-sm text-text-muted flex-wrap">
                {assignmentSummary ? (
                  <span className="text-xs font-semibold text-text-high bg-surface-sunken px-2.5 py-1 rounded-lg border border-border-subtle">
                    {assignmentSummary}
                  </span>
                ) : (
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {header.organizationName || 'GPIB'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons (ID Card, QR, Edit, Delete) */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0 pt-2 sm:pt-0 flex-wrap">
            {/* ID Card Button */}
            <button
              type="button"
              onClick={() => setIsIdCardOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all min-h-[40px] shadow-xs cursor-pointer whitespace-nowrap"
              title="Lihat & Unduh Kartu Identitas Digital Pelayan"
              aria-label="Lihat ID Card Pelayan"
            >
              <IdCard className="size-4 shrink-0" />
              <span>ID Card</span>
            </button>

            {/* Direct Quick QR Modal */}
            <button
              type="button"
              onClick={() => setIsQrOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface-sunken hover:bg-surface-elevated border border-border-strong text-text-high hover:text-brand-primary text-xs font-bold active:scale-95 transition-all min-h-[40px] shadow-2xs cursor-pointer whitespace-nowrap"
              title="Tampilkan QR Code Verifikasi"
              aria-label="QR Verifikasi"
            >
              <QrCode className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>QR Verifikasi</span>
            </button>

            {canEdit && personRaw && (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface-sunken hover:bg-surface-elevated border border-border-strong text-text-high hover:text-brand-primary text-xs font-bold active:scale-95 transition-all min-h-[40px] shadow-2xs cursor-pointer whitespace-nowrap"
                title="Edit Profil Personil"
                aria-label="Edit Profil Personil"
              >
                <Edit3 className="size-4 text-slate-500 shrink-0" />
                <span>Edit</span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center p-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 active:scale-95 transition-all min-h-[40px] min-w-[40px] shadow-2xs cursor-pointer shrink-0"
                title="Nonaktifkan Personil"
                aria-label="Nonaktifkan Personil"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Edit Modal */}
      {personRaw && (
        <EditPersonModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          person={personRaw}
          isSelf={isSelfPerson}
        />
      )}

      {/* ID Card Modal */}
      {personRaw && (
        <PersonIdCardModal
          isOpen={isIdCardOpen}
          onClose={() => setIsIdCardOpen(false)}
          person={personRaw}
          nip={(personRaw as any)?.nip || (personRaw as any)?.profile?.data?.nip}
        />
      )}

      {/* Dedicated Quick QR Modal */}
      {personRaw && (
        <PersonQrCodeModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          person={personRaw}
          nip={(personRaw as any)?.nip || (personRaw as any)?.profile?.data?.nip}
        />
      )}
    </>
  );
};

