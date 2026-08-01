'use client';

import React, { useState } from 'react';
import { ProfileView } from '@/components/profile/ProfileView';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { updatePendetaPelayananAction } from '../actions';
import { useQueryClient } from '@tanstack/react-query';
import { Lock, X, User as UserIcon } from 'lucide-react';
import { useProfileAkun, useProfilePelayanan } from '@/hooks/use-profile';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

export default function MyProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: akun } = useProfileAkun(user?.id);
  const { data: pelayanan } = useProfilePelayanan(akun?.id_pendeta);

  // Password Modal State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit Pendeta Pelayanan Biodata State
  const [isEditingPelayanan, setIsEditingPelayanan] = useState(false);
  const [editPelNama, setEditPelNama] = useState('');
  const [editPelNip, setEditPelNip] = useState('');
  const [editPelNik, setEditPelNik] = useState('');
  const [editPelGender, setEditPelGender] = useState('Laki-laki');
  const [editPelTglLahir, setEditPelTglLahir] = useState('');
  const [editPelNoWa, setEditPelNoWa] = useState('');
  const [editPelTglTugas, setEditPelTglTugas] = useState('');
  const [editPelJenisPendeta, setEditPelJenisPendeta] = useState('Organik');
  const [isSubmittingPelayanan, setIsSubmittingPelayanan] = useState(false);

  const handleOpenEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password Terlalu Pendek', 'Password minimal terdiri dari 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Kombinasi Tidak Cocok', 'Konfirmasi password baru tidak sama dengan password baru.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast.success('Kata Sandi Diperbarui', 'Kata sandi Anda berhasil diubah. Gunakan kata sandi baru untuk login berikutnya.');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Gagal Mengubah Kata Sandi', error?.message || 'Terjadi kesalahan saat memperbarui kata sandi.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleOpenEditPelayanan = () => {
    const rawGender = pelayanan?.jenis_kelamin || '';
    const isPerempuan = rawGender.toLowerCase().startsWith('p');

    setEditPelNama(pelayanan?.nama_pendeta || akun?.nama_lengkap || user?.nama_lengkap || '');
    setEditPelNip(pelayanan?.nip || '');
    setEditPelNik(pelayanan?.nik || '');
    setEditPelGender(isPerempuan ? 'Perempuan' : 'Laki-laki');
    setEditPelTglLahir(pelayanan?.tgl_lahir ? new Date(pelayanan.tgl_lahir).toISOString().split('T')[0] : '');
    setEditPelNoWa(pelayanan?.no_telepon || akun?.no_hp || '');
    setEditPelTglTugas(pelayanan?.tgl_tugas_awal ? new Date(pelayanan.tgl_tugas_awal).toISOString().split('T')[0] : '');
    setEditPelJenisPendeta(pelayanan?.jenis_pendeta || 'Organik');
    setIsEditingPelayanan(true);
  };

  const handleSavePelayanan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPelNama.trim()) {
      toast.error('Nama Wajib Diisi', 'Silakan masukkan nama lengkap pendeta.');
      return;
    }

    setIsSubmittingPelayanan(true);
    try {
      const targetPendetaId = akun?.id_pendeta || pelayanan?.id_pendeta || (user as any)?.id_pendeta;

      const res = await updatePendetaPelayananAction({
        id_pendeta: targetPendetaId || undefined,
        nama_lengkap: editPelNama.trim(),
        gender: editPelGender,
        tgl_lahir: editPelTglLahir || undefined,
        no_wa: editPelNoWa.trim() || undefined,
        tgl_tugas: editPelTglTugas || undefined,
        jenis_pendeta: editPelJenisPendeta,
        nip: editPelNip.trim() || undefined,
        nik: editPelNik.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || 'Gagal menyimpan data.');
      }

      toast.success('Identitas Diperbarui', 'Data biodata terpusat pendeta berhasil disimpan.');
      setIsEditingPelayanan(false);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile-akun'] }),
        queryClient.invalidateQueries({ queryKey: ['profile-pelayanan'] }),
        queryClient.invalidateQueries({ queryKey: ['current-pendeta'] }),
        queryClient.invalidateQueries({ queryKey: ['pendeta-detail'] }),
      ]);
    } catch (err: any) {
      toast.error('Gagal Simpan Biodata', err?.message || 'Terjadi kesalahan saat menyimpan biodata pendeta.');
    } finally {
      setIsSubmittingPelayanan(false);
    }
  };

  return (
    <div className="pt-4">
      <ProfileView
        userId={user?.id || akun?.id}
        mode="self"
        onEditProfile={handleOpenEditProfile}
        onOpenPasswordModal={() => setIsChangingPassword(true)}
        onEditPelayanan={handleOpenEditPelayanan}
      />

      {/* Modal Edit Profil */}
      <EditProfileModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
      />

      {/* Modal Ubah Kata Sandi */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <Lock size={18} />
                  <span>Ubah Kata Sandi</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Masukkan kata sandi baru Anda untuk akun ini
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Kata Sandi Baru *</label>
                <input
                  type="password"
                  placeholder="Min. 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="field"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Konfirmasi Kata Sandi Baru *</label>
                <input
                  type="password"
                  placeholder="Ketik ulang kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="field"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmittingPassword ? 'Memproses...' : 'Simpan Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Edit Identitas Pelayanan Pendeta */}
      {isEditingPelayanan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <UserIcon size={18} />
                  <span>Edit Identitas Pelayanan Pendeta</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Perbarui biodata terpusat Pendeta Organik GPIB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingPelayanan(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePelayanan} className="space-y-4">
              {/* Nama Lengkap & Gelar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Nama Lengkap Pendeta (Gelar) *</label>
                <input
                  type="text"
                  placeholder="Pdt. Otniel Ferly..."
                  value={editPelNama}
                  onChange={(e) => setEditPelNama(e.target.value)}
                  className="field"
                  required
                />
              </div>

              {/* NIP & NIK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high">NIP (Nomor Induk Pendeta)</label>
                  <input
                    type="text"
                    placeholder="Misal: 198008152005011001"
                    value={editPelNip}
                    onChange={(e) => setEditPelNip(e.target.value)}
                    className="field font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high">NIK (Kependudukan)</label>
                  <input
                    type="text"
                    placeholder="Misal: 3174000000000000"
                    value={editPelNik}
                    onChange={(e) => setEditPelNik(e.target.value)}
                    className="field font-mono"
                  />
                </div>
              </div>

              {/* Jenis Kelamin & Tanggal Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high">Jenis Kelamin *</label>
                  <select
                    value={editPelGender}
                    onChange={(e) => setEditPelGender(e.target.value)}
                    className="field font-medium"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editPelTglLahir}
                    onChange={(e) => setEditPelTglLahir(e.target.value)}
                    className="field font-mono"
                  />
                </div>
              </div>

              {/* Nomor WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Nomor Telepon / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+6281234567890"
                  value={editPelNoWa}
                  onChange={(e) => setEditPelNoWa(e.target.value)}
                  className="field font-mono"
                />
              </div>

              {/* Tanggal Mulai Tugas & Jenis Pendeta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high">Mulai Tugas GPIB</label>
                  <input
                    type="date"
                    value={editPelTglTugas}
                    onChange={(e) => setEditPelTglTugas(e.target.value)}
                    className="field font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-high">Jenis Pendeta *</label>
                  <select
                    value={editPelJenisPendeta}
                    onChange={(e) => setEditPelJenisPendeta(e.target.value)}
                    className="field font-medium"
                  >
                    <option value="Organik">Organik</option>
                    <option value="Non-Organik">Non-Organik</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsEditingPelayanan(false)}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPelayanan}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmittingPelayanan ? 'Memproses...' : 'Simpan Biodata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
