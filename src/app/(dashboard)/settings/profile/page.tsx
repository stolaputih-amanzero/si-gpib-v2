'use client';

import React, { useState, useRef } from 'react';
import { ProfileView } from '@/components/profile/ProfileView';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';
import { updateOwnProfileAction, updatePendetaPelayananAction } from '../actions';
import { useQueryClient } from '@tanstack/react-query';
import { Lock, X, User as UserIcon, Camera, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { compressAvatarImage } from '@/lib/camera/compress';

import { useProfileAkun, useProfilePelayanan } from '@/hooks/use-profile';

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
  const [editNama, setEditNama] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNoHp, setEditNoHp] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  // Edit Pendeta Pelayanan Biodata State
  const [isEditingPelayanan, setIsEditingPelayanan] = useState(false);
  const [editPelNama, setEditPelNama] = useState('');
  const [editPelGender, setEditPelGender] = useState('Laki-laki');
  const [editPelTglLahir, setEditPelTglLahir] = useState('');
  const [editPelNoWa, setEditPelNoWa] = useState('');
  const [editPelTglTugas, setEditPelTglTugas] = useState('');
  const [editPelJenisPendeta, setEditPelJenisPendeta] = useState('Organik');
  const [isSubmittingPelayanan, setIsSubmittingPelayanan] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const rawFile = files[0];

    setIsCompressingAvatar(true);
    try {
      const compressed = await compressAvatarImage(rawFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditAvatar(base64);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Error processing avatar image:', err);
      toast.error('Gagal Memuat Foto', 'Foto tidak dapat diproses, silakan coba foto lain.');
    } finally {
      setIsCompressingAvatar(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleOpenEditProfile = () => {
    const phoneValue =
      pelayanan?.no_telepon ||
      akun?.no_hp ||
      user?.no_telepon ||
      user?.no_hp ||
      user?.user_metadata?.no_telepon ||
      user?.user_metadata?.no_hp ||
      '';

    setEditNama(pelayanan?.nama_pendeta || akun?.nama_lengkap || user?.nama_lengkap || user?.user_metadata?.nama_lengkap || '');
    setEditEmail(user?.email || '');
    setEditNoHp(phoneValue);
    setEditAvatar(akun?.avatar_url || akun?.foto_url || pelayanan?.foto_url || user?.avatar_url || user?.user_metadata?.avatar_url || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNama.trim()) {
      toast.error('Nama Wajib Diisi', 'Silakan masukkan nama lengkap Anda.');
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const res = await updateOwnProfileAction({
        nama_lengkap: editNama.trim(),
        email: editEmail.trim(),
        no_hp: editNoHp.trim(),
        avatar_url: editAvatar.trim(),
      });

      const updatedAvatar = res.avatar_url || editAvatar.trim();

      // Update local storage cache directly for instant UI update
      try {
        const cachedUser = localStorage.getItem('si_gpib_cached_user');
        const parsed = cachedUser ? JSON.parse(cachedUser) : {};
        parsed.avatar_url = updatedAvatar;
        parsed.foto_url = updatedAvatar;
        parsed.nama_lengkap = editNama.trim();
        parsed.user_metadata = {
          ...(parsed.user_metadata || {}),
          avatar_url: updatedAvatar,
          foto_url: updatedAvatar,
          picture: updatedAvatar,
          nama_lengkap: editNama.trim(),
        };
        localStorage.setItem('si_gpib_cached_user', JSON.stringify(parsed));

        const cachedCurr = localStorage.getItem('si_gpib_cached_current_user');
        const parsedCurr = cachedCurr ? JSON.parse(cachedCurr) : {};
        parsedCurr.nama_lengkap = editNama.trim();
        parsedCurr.avatar_url = updatedAvatar;
        parsedCurr.foto_url = updatedAvatar;
        localStorage.setItem('si_gpib_cached_current_user', JSON.stringify(parsedCurr));
      } catch {}

      toast.success('Profil Diperbarui', 'Data profil Anda berhasil disimpan.');
      setIsEditingProfile(false);
      
      // Invalidate all related profile & auth queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile-akun'] }),
        queryClient.invalidateQueries({ queryKey: ['profile-pelayanan'] }),
        queryClient.invalidateQueries({ queryKey: ['current-user-auth'] }),
      ]);
    } catch (err: any) {
      toast.error('Gagal Simpan Profil', err?.message || 'Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setIsSubmittingProfile(false);
    }
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
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <UserIcon size={18} />
                  <span>Edit Profil Pengguna</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Perbarui foto profil, nama lengkap, dan kontak Anda
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Foto Profil / Avatar Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-high">Foto Profil / Avatar</label>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-surface-sunken border border-border-subtle">
                  {/* Avatar Preview */}
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-brand-primary/20 relative group">
                    {editAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editAvatar} alt="Preview Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-brand-primary" />
                    )}
                    {editAvatar && (
                      <button
                        type="button"
                        onClick={() => setEditAvatar('')}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus Foto"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Buttons: Kamera & Galeri Upload */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={isCompressingAvatar}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all min-h-[40px] disabled:opacity-50"
                      >
                        {isCompressingAvatar ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                        <span>Kamera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={isCompressingAvatar}
                        className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-surface-elevated text-text-high border border-border-subtle hover:bg-surface-sunken text-xs font-bold active:scale-95 transition-all min-h-[40px] disabled:opacity-50"
                      >
                        <ImageIcon size={14} className="text-brand-primary" />
                        <span>Galeri</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted truncate">Kamera HP atau upload galeri (Resolusi HD s/d 1MB)</p>
                  </div>
                </div>

                {/* Hidden File Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
              </div>

              {/* 2. Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Nama Lengkap *</label>
                <input
                  type="text"
                  placeholder="Contoh: Pdt. Otniel Jonatan"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="field"
                  required
                />
              </div>

              {/* 3. Email Terdaftar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Email Terdaftar *</label>
                <input
                  type="email"
                  placeholder="Contoh: user@gpib.or.id"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="field font-mono"
                  required
                />
              </div>

              {/* 4. Role & Otorisasi Akses (Read-Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Role & Otorisasi Akses</label>
                <input
                  type="text"
                  value={(user?.role || user?.user_metadata?.role || 'PELAYAN')?.toUpperCase()}
                  disabled
                  className="field bg-surface-sunken font-extrabold text-brand-primary cursor-not-allowed uppercase"
                />
              </div>

              {/* 5. Nomor Telepon / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Nomor Telepon / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="Contoh: +6287730116407"
                  value={editNoHp}
                  onChange={(e) => setEditNoHp(e.target.value)}
                  className="field font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Atau Gunakan URL Foto</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="field text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProfile || isCompressingAvatar}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmittingProfile ? 'Memproses...' : 'Simpan Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
