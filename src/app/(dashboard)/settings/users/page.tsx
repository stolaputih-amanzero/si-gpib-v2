'use client';

import { useState } from 'react';
import {
  useUsersList,
  useUpdateUserRole,
  useCreateUser,
  useDeleteUser,
  UserManagementItem,
  UserRole,
} from '@/hooks/use-users-management';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { JemaatCascadingSelector } from '@/components/hierarki/HierarkiSelector/JemaatCascadingSelector';
import { MupelSelect } from '@/components/hierarki/HierarkiSelector/MupelSelect';
import { useToast } from '@/components/ui/toast';
import { RoleBadge } from '@/components/profile/RoleBadge';
import {
  ShieldCheck,
  Search,
  UserCheck,
  Crown,
  Building,
  Edit,
  X,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Users,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCurrentUser, isSuperUserRole } from '@/hooks/use-current-user';

function getHierarchyDisplayLabel(user: UserManagementItem) {
  const role = user.role;

  let mupelLabel = user.mupel?.nama_mupel || user.id_mupel;
  if (!mupelLabel) {
    mupelLabel = role === 'superadmin' ? 'Semua (Nasional)' : 'Belum Ditentukan';
  }

  let jemaatLabel = user.jemaat_induk?.nama_induk || user.id_induk;
  if (!jemaatLabel) {
    if (role === 'superadmin') jemaatLabel = 'Semua (Nasional)';
    else if (role === 'admin_mupel') jemaatLabel = 'Seluruh Jemaat di Mupel';
    else jemaatLabel = 'Belum Ditentukan';
  }

  let posLabel = user.pos_pelkes?.nama_pos || user.id_pos;
  if (!posLabel) {
    if (role === 'superadmin') posLabel = 'Semua (Nasional)';
    else if (role === 'admin_mupel') posLabel = 'Seluruh Pos Pelkes di Mupel';
    else if (role === 'pj_pos') posLabel = 'Seluruh Pos Pelkes di Jemaat (Multi-Pos)';
    else if (role === 'admin_jemaat' || role === 'pendeta') posLabel = 'Seluruh Pos Pelkes di Jemaat';
    else posLabel = 'Belum Ditentukan';
  } else if (role === 'pj_pos') {
    posLabel = `${posLabel} (Multi-Pos)`;
  }

  return { mupelLabel, jemaatLabel, posLabel };
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const isAuthorized = isSuperUserRole(currentUser?.role);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<UserManagementItem | null>(null);

  // Form states for editing modal
  const [formRole, setFormRole] = useState<UserRole>('pelayan');
  const [formNamaLengkap, setFormNamaLengkap] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formMupel, setFormMupel] = useState<string>('');
  const [formInduk, setFormInduk] = useState<string>('');
  const [formPos, setFormPos] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');

  // Form states for adding modal
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addNamaLengkap, setAddNamaLengkap] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('pelayan');
  const [addMupel, setAddMupel] = useState('');
  const [addInduk, setAddInduk] = useState('');
  const [addPos, setAddPos] = useState('');
  const [addStatus, setAddStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');

  const { data: usersList, isLoading } = useUsersList(searchQuery, selectedRoleFilter);
  const updateRoleMutation = useUpdateUserRole();
  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();

  if (!isUserLoading && currentUser && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-ink-primary">Otorisasi Akses Dibatasi</h2>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-md mt-1">
            Halaman Manajemen User & Role hanya dapat diakses oleh pengguna dengan role <strong>SuperAdmin</strong> atau <strong>Super User</strong>.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-soft hover:bg-brand-700 transition-all min-h-[44px]"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const handleOpenEditModal = (user: UserManagementItem) => {
    setEditingUser(user);
    setFormRole(user.role);
    setFormNamaLengkap(user.nama_lengkap || '');
    setFormEmail(user.email || '');
    setFormMupel(user.id_mupel || '');
    setFormInduk(user.id_induk || '');
    setFormPos(user.id_pos || '');
    setFormStatus(user.status || 'Active');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateRoleMutation.mutateAsync({
        id: editingUser.id,
        role: formRole,
        nama_lengkap: formNamaLengkap,
        email: formEmail,
        id_mupel: formMupel || null,
        id_induk: formInduk || null,
        id_pos: formPos || null,
        status: formStatus,
      });

      toast.success('Pengaturan Disimpan', `Profil & penetapan hierarki untuk ${formNamaLengkap} berhasil diperbarui.`);
      setEditingUser(null);
    } catch (error: any) {
      toast.error('Gagal Menyimpan', error?.message || 'Terjadi kesalahan saat memperbarui role pengguna.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNamaLengkap || !addEmail) {
      toast.error('Data Belum Lengkap', 'Nama Lengkap dan Email wajib diisi.');
      return;
    }

    try {
      const result = await createUserMutation.mutateAsync({
        nama_lengkap: addNamaLengkap,
        email: addEmail,
        password: addPassword || undefined,
        role: addRole,
        id_mupel: addMupel || null,
        id_induk: addInduk || null,
        id_pos: addPos || null,
        status: addStatus,
      });

      toast.success(
        'Pengguna Dibuat',
        `Akun ${addNamaLengkap} berhasil dibuat.${result?.password ? ` Password sementara: ${result.password}` : ''}`
      );

      setIsAddingUser(false);
      setAddNamaLengkap('');
      setAddEmail('');
      setAddPassword('');
      setAddRole('pelayan');
      setAddMupel('');
      setAddInduk('');
      setAddPos('');
      setAddStatus('Active');
    } catch (error: any) {
      toast.error('Gagal Membuat Pengguna', error?.message || 'Terjadi kesalahan saat membuat pengguna.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${userName}? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success('Pengguna Dihapus', `Akun ${userName} berhasil dihapus dari sistem.`);
      setEditingUser(null);
    } catch (error: any) {
      toast.error('Gagal Menghapus', error?.message || 'Terjadi kesalahan saat menghapus pengguna.');
    }
  };

  const totalUsers = usersList?.length || 0;
  const superadminCount = usersList?.filter((u) => u.role === 'superadmin' || u.role === 'super_user').length || 0;
  const mupelAdminCount = usersList?.filter((u) => u.role === 'admin_mupel').length || 0;
  const jemaatAdminCount = usersList?.filter((u) => u.role === 'admin_jemaat' || u.role === 'pendeta' || u.role === 'kmj').length || 0;

  return (
    <div className="w-full space-y-6 pb-20 px-2 sm:px-4 md:px-6 max-w-7xl mx-auto">
      {/* Top Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-start gap-3">
          <Link
            href="/settings"
            className="p-2.5 rounded-xl text-ink-primary hover:bg-surface-sunken transition-all border border-line-subtle min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Kembali ke Pengaturan"
          >
            <ChevronLeft size={20} className="text-brand-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink-primary tracking-tight">
                Manajemen Pengguna & RBAC
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                Superuser Exclusive
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-tertiary mt-0.5">
              Kelola otorisasi role, hak akses, dan penguncian wilayah Poka-Yoke
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingUser(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs min-h-[44px] shrink-0 sm:self-start"
        >
          <Plus size={18} />
          <span>Pengguna</span>
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-1 p-3.5 sm:p-4 rounded-2xl border border-line-subtle shadow-2xs">
          <p className="text-xs text-ink-tertiary font-medium">Total Akun Terdaftar</p>
          <p className="text-xl sm:text-2xl font-display font-semibold text-ink-primary tabular-nums mt-1">{totalUsers}</p>
          <p className="text-[11px] text-ink-tertiary mt-0.5">Seluruh Pengguna</p>
        </div>
        <div className="bg-surface-1 p-3.5 sm:p-4 rounded-2xl border border-line-subtle shadow-2xs">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
            <Crown size={14} />
            <span>Superadmin</span>
          </p>
          <p className="text-xl sm:text-2xl font-display font-semibold text-purple-600 dark:text-purple-400 tabular-nums mt-1">{superadminCount}</p>
          <p className="text-[11px] text-ink-tertiary mt-0.5">Akses Nasional</p>
        </div>
        <div className="bg-surface-1 p-3.5 sm:p-4 rounded-2xl border border-line-subtle shadow-2xs">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <Building size={14} />
            <span>Admin Mupel</span>
          </p>
          <p className="text-xl sm:text-2xl font-display font-semibold text-amber-600 dark:text-amber-400 tabular-nums mt-1">{mupelAdminCount}</p>
          <p className="text-[11px] text-ink-tertiary mt-0.5">Akses Mupel</p>
        </div>
        <div className="bg-surface-1 p-3.5 sm:p-4 rounded-2xl border border-line-subtle shadow-2xs">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            <UserCheck size={14} />
            <span>Admin Jemaat/KMJ</span>
          </p>
          <p className="text-xl sm:text-2xl font-display font-semibold text-blue-600 dark:text-blue-400 tabular-nums mt-1">{jemaatAdminCount}</p>
          <p className="text-[11px] text-ink-tertiary mt-0.5">Akses Jemaat</p>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-surface-1 p-3.5 sm:p-4 rounded-2xl border border-line-subtle shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" size={18} />
            <input
              type="text"
              placeholder="Cari pengguna (nama, email, mupel, jemaat, pos)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-xs sm:text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            />
          </div>
          <div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-xs sm:text-sm font-semibold text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            >
              <option value="all">Semua Role Pengguna</option>
              <option value="superadmin">Superadmin (Sinode)</option>
              <option value="admin_mupel">Admin Mupel</option>
              <option value="admin_jemaat">Admin Jemaat (KMJ)</option>
              <option value="pj_pos">PJ Pos Pelkes</option>
              <option value="pendeta">Pendeta GPIB</option>
              <option value="pelayan">Pelayan Field</option>
              <option value="relawan">Relawan</option>
              <option value="read_only">Read Only (Pending Role)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-semibold text-ink-primary font-display">
            Daftar Pengguna ({usersList?.length || 0})
          </h2>
          <span className="text-xs text-ink-tertiary">
            Otorisasi Terpusat Poka-Yoke
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-1 p-4 rounded-2xl border border-line-subtle animate-pulse space-y-3">
                <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : usersList && usersList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {usersList.map((user) => {
              const { mupelLabel, jemaatLabel, posLabel } = getHierarchyDisplayLabel(user);

              return (
                <div
                  key={user.id}
                  className="bg-surface-1 p-4 rounded-2xl border border-line-subtle shadow-2xs space-y-3 hover:border-brand-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Avatar & User Details */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-600 font-display font-bold text-base flex items-center justify-center shrink-0 border border-brand-500/20 shadow-2xs">
                        {user.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-semibold text-sm sm:text-base text-ink-primary truncate leading-snug">
                          {user.nama_lengkap}
                        </h3>
                        <p className="text-xs text-ink-tertiary truncate font-mono">{user.email}</p>
                        
                        {/* Role Badge safely wrapped under name/email */}
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <RoleBadge role={user.role} />
                        </div>
                      </div>
                    </div>

                    {/* Hierarchy Assignment Details Box */}
                    <div className="bg-surface-sunken p-3 rounded-xl border border-line-hairline text-xs space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block">Assigned Mupel</span>
                          <span className="font-semibold text-ink-primary text-xs block truncate" title={mupelLabel}>{mupelLabel}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block">Assigned Jemaat</span>
                          <span className="font-semibold text-ink-primary text-xs block truncate" title={jemaatLabel}>{jemaatLabel}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block">Assigned Pos Pelkes</span>
                          <span className="font-semibold text-ink-primary text-xs block truncate" title={posLabel}>{posLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-line-hairline">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full self-start sm:self-auto',
                        user.status === 'Active'
                          ? 'bg-ok-soft text-ok border border-ok/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      )}
                    >
                      <CheckCircle2 size={12} />
                      <span>{user.status || 'Active'}</span>
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/settings/users/${user.id}`}
                        className="px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center gap-1 text-xs font-semibold min-h-[38px] flex-1 sm:flex-initial"
                        title="Buka Profil 360° Pengguna"
                      >
                        <UserCheck size={14} />
                        <span>Profil 360°</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(user)}
                        className="px-3 py-1.5 rounded-xl bg-surface-sunken hover:bg-surface-elevated text-xs font-semibold text-ink-primary border border-line-subtle transition-all flex items-center justify-center gap-1.5 min-h-[38px] flex-1 sm:flex-initial"
                      >
                        <Edit size={14} />
                        <span>Ubah Role</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-1 rounded-2xl p-8 text-center border border-line-subtle space-y-2">
            <Users size={36} className="mx-auto text-ink-tertiary opacity-50" />
            <p className="font-semibold text-ink-primary text-sm">Tidak Ada Pengguna Ditemukan</p>
            <p className="text-xs text-ink-tertiary">
              Coba sesuaikan kata kunci pencarian atau kriteria filter role.
            </p>
          </div>
        )}
      </div>

      {/* Modal Edit Role & Hierarchy Assignment */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-line-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-600 flex items-center gap-2">
                  <ShieldCheck size={18} />
                  <span>Atur Role & Otorisasi Poka-Yoke</span>
                </h2>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  User: <strong className="text-ink-primary">{editingUser.nama_lengkap}</strong> ({editingUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-ink-tertiary hover:text-ink-primary min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formNamaLengkap}
                  onChange={(e) => setFormNamaLengkap(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                  required
                />
              </div>

              {/* Select Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Role Hak Akses (RBAC) *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm font-semibold text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
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

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Status Akun Pengguna</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                >
                  <option value="Active">Active (Aktif)</option>
                  <option value="Inactive">Inactive (Non-Aktif)</option>
                  <option value="Pending">Pending Verification</option>
                </select>
              </div>

              {/* Dynamic Cascading Selector Based on Role Requirements */}
              <div className="space-y-2 pt-2 border-t border-line-subtle">
                <label className="text-xs font-semibold text-ink-primary flex items-center justify-between">
                  <span>Penetapan Wilayah Hierarki Poka-Yoke</span>
                  <span className="text-[11px] text-brand-600 font-normal flex items-center gap-1">
                    <Lock size={12} /> Auto-Lock untuk Role
                  </span>
                </label>

                {formRole === 'superadmin' ? (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-medium">
                    ✨ <strong>Superadmin (Sinode)</strong> memiliki akses nasional secara bebas ke seluruh Mupel, Jemaat, dan Pos Pelkes.
                  </div>
                ) : formRole === 'admin_mupel' ? (
                  <div className="space-y-2">
                    <MupelSelect
                      value={formMupel}
                      onChange={setFormMupel}
                      required={true}
                    />
                    <p className="text-[11px] text-ink-tertiary">
                      Admin Mupel hanya dapat mengakses data dalam Mupel ini.
                    </p>
                  </div>
                ) : formRole === 'admin_jemaat' || formRole === 'pendeta' || formRole === 'pj_pos' ? (
                  <div className="space-y-2">
                    <JemaatCascadingSelector
                      value={formInduk}
                      onChange={setFormInduk}
                      onMupelChange={setFormMupel}
                      defaultIndukId={formInduk || undefined}
                    />
                    <p className="text-[11px] text-ink-tertiary">
                      PJ Pos Pelkes / Admin Jemaat / KMJ terkunci pada Mupel & Jemaat Induk ini (otomatis memiliki hak akses ke seluruh Pos Pelkes di wilayah Jemaat Induk).
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
                    <p className="text-[11px] text-ink-tertiary">
                      PJ Pos Pelkes / Pelayan / Relawan terkunci pada Mupel & Jemaat Induk ini (PJ memiliki hak akses ke seluruh Pos Pelkes di wilayah Jemaat Induk).
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-line-subtle">
                <button
                  type="button"
                  onClick={() => handleDeleteUser(editingUser.id, editingUser.nama_lengkap)}
                  className="px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 transition-all flex items-center justify-center min-h-[44px] active:scale-95"
                  title="Hapus Pengguna"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-line-subtle text-xs font-bold text-ink-primary hover:bg-surface-sunken transition-all min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateRoleMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all shadow-xs min-h-[44px] disabled:opacity-50"
                >
                  {updateRoleMutation.isPending ? 'Menyimpan...' : 'Simpan Otorisasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-line-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-line-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-600 flex items-center gap-2">
                  <Plus size={18} />
                  <span>Tambah Pengguna Baru</span>
                </h2>
                <p className="text-xs text-ink-tertiary mt-0.5">
                  Buat akun login baru dan tentukan hak akses penugasannya
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-ink-tertiary hover:text-ink-primary min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Nama Lengkap *</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={addNamaLengkap}
                  onChange={(e) => setAddNamaLengkap(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Email *</label>
                <input
                  type="email"
                  placeholder="budi@example.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-ink-primary">Password *</label>
                  <span className="text-[10px] text-ink-tertiary">Kosongkan untuk auto-generate</span>
                </div>
                <input
                  type="password"
                  placeholder="Min. 6 karakter"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                  minLength={6}
                />
              </div>

              {/* Select Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Role Hak Akses (RBAC) *</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm font-semibold text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
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

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-primary">Status Akun Pengguna</label>
                <select
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line-subtle bg-surface-base text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                >
                  <option value="Active">Active (Aktif)</option>
                  <option value="Inactive">Inactive (Non-Aktif)</option>
                  <option value="Pending">Pending Verification</option>
                </select>
              </div>

              {/* Dynamic Cascading Selector Based on Role Requirements */}
              <div className="space-y-2 pt-2 border-t border-line-subtle">
                <label className="text-xs font-semibold text-ink-primary flex items-center justify-between">
                  <span>Penetapan Wilayah Hierarki Poka-Yoke</span>
                  <span className="text-[11px] text-brand-600 font-normal flex items-center gap-1">
                    <Lock size={12} /> Auto-Lock untuk Role
                  </span>
                </label>

                {addRole === 'superadmin' ? (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-medium">
                    ✨ <strong>Superadmin (Sinode)</strong> memiliki akses nasional secara bebas ke seluruh Mupel, Jemaat, dan Pos Pelkes.
                  </div>
                ) : addRole === 'admin_mupel' ? (
                  <div className="space-y-2">
                    <MupelSelect
                      value={addMupel}
                      onChange={setAddMupel}
                      required={true}
                    />
                    <p className="text-[11px] text-ink-tertiary">
                      Admin Mupel hanya dapat mengakses data dalam Mupel ini.
                    </p>
                  </div>
                ) : addRole === 'admin_jemaat' || addRole === 'pendeta' || addRole === 'pj_pos' ? (
                  <div className="space-y-2">
                    <JemaatCascadingSelector
                      value={addInduk}
                      onChange={setAddInduk}
                      onMupelChange={setAddMupel}
                      defaultIndukId={addInduk || undefined}
                    />
                    <p className="text-[11px] text-ink-tertiary">
                      PJ Pos Pelkes / Admin Jemaat / KMJ terkunci pada Mupel & Jemaat Induk ini (otomatis memiliki hak akses ke seluruh Pos Pelkes di wilayah Jemaat Induk).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <PosCascadingSelector
                      value={addPos}
                      onChange={setAddPos}
                      onMupelChange={setAddMupel}
                      onJemaatChange={setAddInduk}
                      defaultPosId={addPos || undefined}
                      required={false}
                    />
                    <p className="text-[11px] text-ink-tertiary">
                      PJ Pos Pelkes / Pelayan / Relawan terkunci pada Mupel & Jemaat Induk ini (PJ memiliki hak akses ke seluruh Pos Pelkes di wilayah Jemaat Induk).
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-line-subtle">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="flex-1 py-2.5 rounded-xl border border-line-subtle text-xs font-bold text-ink-primary hover:bg-surface-sunken transition-all min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all shadow-xs min-h-[44px] disabled:opacity-50"
                >
                  {createUserMutation.isPending ? 'Membuat...' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
