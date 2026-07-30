'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ProfileView } from '@/components/profile/ProfileView';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';
import { useProfileAkun } from '@/hooks/use-profile';
import { useUpdateUserRole, UserRole } from '@/hooks/use-users-management';
import { ChevronLeft, Lock, ShieldCheck, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { MupelSelect } from '@/components/hierarki/HierarkiSelector/MupelSelect';
import { JemaatCascadingSelector } from '@/components/hierarki/HierarkiSelector/JemaatCascadingSelector';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailProfile360Page({ params }: UserDetailPageProps) {
  const resolvedParams = use(params);
  const targetUserId = resolvedParams.id;

  const { toast } = useToast();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: targetAkun, isLoading: isTargetLoading } = useProfileAkun(targetUserId);

  const isSuperUser = isSuperUserRole(currentUser?.role);
  const isMupelAdmin = currentUser?.role === 'admin_mupel';

  // Modal State for Change Role (Supervise Mode)
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [formRole, setFormRole] = useState<UserRole>('pelayan');
  const [formMupel, setFormMupel] = useState<string>('');
  const [formInduk, setFormInduk] = useState<string>('');
  const [formPos, setFormPos] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');

  const updateRoleMutation = useUpdateUserRole();

  // Guard Access
  const isSameMupel =
    Boolean(currentUser?.id_mupel) &&
    Boolean(targetAkun?.id_mupel) &&
    currentUser?.id_mupel === targetAkun?.id_mupel;

  const isAuthorized = isSuperUser || (isMupelAdmin && isSameMupel);

  if (isUserLoading || isTargetLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4 animate-pulse">
        <div className="h-10 bg-surface-sunken rounded w-36 skeleton" />
        <div className="h-48 bg-surface-sunken rounded-2xl skeleton" />
      </div>
    );
  }

  if (currentUser && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-ink-primary">Otorisasi Pengawasan Dibatasi</h2>
          <p className="text-xs sm:text-sm text-ink-tertiary max-w-md mt-1">
            Anda tidak memiliki wewenang untuk melihat profil 360° pengguna dari wilayah lain.
          </p>
        </div>
        <Link
          href="/settings/users"
          className="btn btn-primary text-xs"
        >
          Kembali ke Daftar Pengguna
        </Link>
      </div>
    );
  }

  const handleOpenChangeRole = () => {
    if (!targetAkun) return;
    setFormRole((targetAkun.role as UserRole) || 'pelayan');
    setFormMupel(targetAkun.id_mupel || '');
    setFormInduk(targetAkun.id_induk || '');
    setFormPos(targetAkun.id_pos || '');
    setFormStatus(targetAkun.status || 'Active');
    setIsChangingRole(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAkun) return;

    try {
      await updateRoleMutation.mutateAsync({
        id: targetAkun.id,
        role: formRole,
        nama_lengkap: targetAkun.nama_lengkap,
        email: targetAkun.email,
        id_mupel: formMupel || null,
        id_induk: formInduk || null,
        id_pos: formPos || null,
        status: formStatus,
      });

      toast.success('Role & Otorisasi Disimpan', `Otorisasi untuk ${targetAkun.nama_lengkap} berhasil diperbarui.`);
      setIsChangingRole(false);
    } catch (error: any) {
      toast.error('Gagal Menyimpan Role', error?.message || 'Terjadi kesalahan saat memperbarui role.');
    }
  };

  return (
    <div className="pt-4 space-y-4">
      {/* Top Header Navigation */}
      <div className="max-w-4xl mx-auto px-2.5 sm:px-4 md:px-6 flex items-center justify-between">
        <Link
          href="/settings/users"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-1 border border-line-subtle text-xs font-semibold text-ink-primary hover:bg-surface-sunken transition-all min-h-[44px]"
        >
          <ChevronLeft size={18} className="text-brand-600" />
          <span>Kembali ke Daftar User</span>
        </Link>

        <span className="text-xs font-mono font-medium text-ink-tertiary">
          Supervision 360° Mode
        </span>
      </div>

      <ProfileView
        userId={targetUserId}
        mode="supervise"
        onChangeRole={handleOpenChangeRole}
      />

      {/* Modal Change Role & Hierarchy */}
      {isChangingRole && targetAkun && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <ShieldCheck size={18} />
                  <span>Ubah Role & Otorisasi Poka-Yoke</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Pengguna: <strong className="text-text-high">{targetAkun.nama_lengkap}</strong> ({targetAkun.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingRole(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Role Hak Akses (RBAC) *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="field font-semibold"
                >
                  <option value="superadmin">Superadmin (Sinode) - Akses Penuh Nasional</option>
                  <option value="admin_mupel">Admin Mupel - Terkunci 1 Mupel</option>
                  <option value="admin_jemaat">Admin Jemaat / KMJ - Terkunci 1 Jemaat</option>
                  <option value="pj_pos">PJ Pos Pelkes - Terkunci 1 Jemaat Induk (Akses Multi-Pos Pelkes)</option>
                  <option value="pendeta">Pendeta GPIB</option>
                  <option value="pelayan">Pelayan Field</option>
                  <option value="relawan">Relawan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Status Akun</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="field"
                >
                  <option value="Active">Active (Aktif)</option>
                  <option value="Inactive">Inactive (Non-Aktif)</option>
                  <option value="Pending">Pending Verification</option>
                </select>
              </div>

              {/* Hierarchy Cascading Selector */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <label className="text-xs font-semibold text-text-high flex items-center justify-between">
                  <span>Penetapan Wilayah Poka-Yoke</span>
                  <span className="text-[11px] text-brand-primary flex items-center gap-1">
                    <Lock size={12} /> Auto-Lock Role
                  </span>
                </label>

                {formRole === 'superadmin' ? (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-600 rounded-xl text-xs font-medium">
                    Superadmin memiliki akses bebas nasional ke seluruh Mupel, Jemaat, dan Pos.
                  </div>
                ) : formRole === 'admin_mupel' ? (
                  <div className="space-y-2">
                    <MupelSelect value={formMupel} onChange={setFormMupel} required={true} />
                  </div>
                ) : formRole === 'admin_jemaat' || formRole === 'pendeta' || formRole === 'pj_pos' ? (
                  <div className="space-y-2">
                    <JemaatCascadingSelector
                      value={formInduk}
                      onChange={setFormInduk}
                      onMupelChange={setFormMupel}
                      defaultIndukId={formInduk || undefined}
                    />
                    <p className="text-[11px] text-text-muted">
                      PJ Pos Pelkes / Admin Jemaat terkunci pada Mupel & Jemaat Induk ini (otomatis memiliki hak akses ke seluruh Pos Pelkes di wilayah Jemaat Induk).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <PosCascadingSelector
                      value={formPos}
                      onChange={setFormPos}
                      onMupelChange={setFormMupel}
                      onJemaatChange={setFormInduk}
                      defaultPosId={formPos || undefined}
                      required={false}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsChangingRole(false)}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateRoleMutation.isPending}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {updateRoleMutation.isPending ? 'Menyimpan...' : 'Simpan Otorisasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
