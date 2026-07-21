'use client';

import { useState } from 'react';
import {
  useUsersList,
  useUpdateUserRole,
  UserManagementItem,
  UserRole,
} from '@/hooks/use-users-management';
import { PosCascadingSelector } from '@/components/hierarki/HierarkiSelector/PosCascadingSelector';
import { JemaatCascadingSelector } from '@/components/hierarki/HierarkiSelector/JemaatCascadingSelector';
import { MupelSelect } from '@/components/hierarki/HierarkiSelector/MupelSelect';
import { useToast } from '@/components/ui/toast';
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
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<UserRole, { label: string; bg: string; text: string }> = {
  superadmin: { label: 'Superadmin (Sinode)', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  admin_mupel: { label: 'Admin Mupel', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  admin_jemaat: { label: 'Admin Jemaat (KMJ)', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  pj_pos: { label: 'PJ Pos Pelkes', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  pendeta: { label: 'Pendeta GPIB', bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
  pelayan: { label: 'Pelayan Field', bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
  relawan: { label: 'Relawan', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
};

export default function UserManagementPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<UserManagementItem | null>(null);

  // Form states for modal
  const [formRole, setFormRole] = useState<UserRole>('pelayan');
  const [formMupel, setFormMupel] = useState<string>('');
  const [formInduk, setFormInduk] = useState<string>('');
  const [formPos, setFormPos] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');

  const { data: usersList, isLoading } = useUsersList(searchQuery, selectedRoleFilter);
  const updateRoleMutation = useUpdateUserRole();

  const handleOpenEditModal = (user: UserManagementItem) => {
    setEditingUser(user);
    setFormRole(user.role);
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
        id_mupel: formMupel || null,
        id_induk: formInduk || null,
        id_pos: formPos || null,
        status: formStatus,
      });

      toast.success('Pengaturan Disimpan', `Role & penetapan hierarki untuk ${editingUser.nama_lengkap} berhasil diperbarui.`);
      setEditingUser(null);
    } catch (error: any) {
      toast.error('Gagal Menyimpan', error?.message || 'Terjadi kesalahan saat memperbarui role pengguna.');
    }
  };

  const totalUsers = usersList?.length || 0;
  const superadminCount = usersList?.filter((u) => u.role === 'superadmin').length || 0;
  const mupelAdminCount = usersList?.filter((u) => u.role === 'admin_mupel').length || 0;
  const jemaatAdminCount = usersList?.filter((u) => u.role === 'admin_jemaat' || u.role === 'pendeta').length || 0;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="p-2.5 rounded-xl text-text-high hover:bg-surface-sunken transition-all border border-border-subtle/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Kembali ke Pengaturan"
          >
            <ChevronLeft size={20} className="text-brand-primary" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-brand-primary">
                Manajemen Pengguna & RBAC
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Superuser Exclusive
              </span>
            </div>
            <p className="text-xs md:text-sm text-text-muted mt-0.5">
              Kelola otorisasi role, hak akses, dan penguncian wilayah Poka-Yoke
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-text-muted font-medium">Total Akun Terdaftar</p>
          <p className="text-2xl font-serif font-bold text-brand-primary tabular-nums mt-1">{totalUsers}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Seluruh Pengguna</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
            <Crown size={14} />
            <span>Superadmin</span>
          </p>
          <p className="text-2xl font-serif font-bold text-purple-600 dark:text-purple-400 tabular-nums mt-1">{superadminCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Akses Nasional</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <Building size={14} />
            <span>Admin Mupel</span>
          </p>
          <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-1">{mupelAdminCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Akses Mupel</p>
        </div>
        <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            <UserCheck size={14} />
            <span>Admin Jemaat/KMJ</span>
          </p>
          <p className="text-2xl font-serif font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-1">{jemaatAdminCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Akses Jemaat</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Cari pengguna (nama, email, mupel, jemaat, pos)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            />
          </div>
          <div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
            >
              <option value="all">Semua Role Pengguna</option>
              <option value="superadmin">Superadmin (Sinode)</option>
              <option value="admin_mupel">Admin Mupel</option>
              <option value="admin_jemaat">Admin Jemaat (KMJ)</option>
              <option value="pj_pos">PJ Pos Pelkes</option>
              <option value="pendeta">Pendeta GPIB</option>
              <option value="pelayan">Pelayan Field</option>
              <option value="relawan">Relawan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-high">
            Daftar Pengguna ({usersList?.length || 0})
          </h2>
          <span className="text-xs text-text-muted">
            Otorisasi Terpusat Poka-Yoke
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle animate-pulse space-y-3">
                <div className="h-4 bg-surface-sunken rounded w-3/4"></div>
                <div className="h-3 bg-surface-sunken rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : usersList && usersList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {usersList.map((user) => {
              const roleMeta = ROLE_LABELS[user.role] || {
                label: user.role,
                bg: 'bg-surface-sunken',
                text: 'text-text-high',
              };

              return (
                <div
                  key={user.id}
                  className="bg-surface-elevated p-4 rounded-2xl border border-border-subtle shadow-soft space-y-3 hover:border-brand-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-serif font-bold text-base flex items-center justify-center shrink-0">
                        {user.nama_lengkap.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-text-high truncate">
                          {user.nama_lengkap}
                        </h3>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0',
                        roleMeta.bg,
                        roleMeta.text
                      )}
                    >
                      {roleMeta.label}
                    </span>
                  </div>

                  {/* Hierarchy Assignment Details */}
                  <div className="bg-surface-base p-2.5 rounded-xl border border-border-subtle/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Assigned Mupel:</span>
                      <span className="font-semibold text-text-high">
                        {user.mupel?.nama_mupel || user.id_mupel || 'Semua (Bebas)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Assigned Jemaat:</span>
                      <span className="font-semibold text-text-high">
                        {user.jemaat_induk?.nama_induk || user.id_induk || 'Semua (Bebas)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Assigned Pos Pelkes:</span>
                      <span className="font-semibold text-text-high">
                        {user.pos_pelkes?.nama_pos || user.id_pos || 'Semua (Bebas)'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md',
                        user.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      )}
                    >
                      <CheckCircle2 size={12} />
                      <span>{user.status || 'Active'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(user)}
                      className="px-3 py-1.5 rounded-xl bg-surface-sunken text-xs font-semibold text-text-high hover:bg-brand-primary hover:text-white transition-all flex items-center gap-1.5 min-h-[36px]"
                    >
                      <Edit size={14} />
                      <span>Ubah Role & Otorisasi</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-elevated rounded-2xl p-8 text-center border border-border-subtle space-y-2">
            <Users size={36} className="mx-auto text-text-muted opacity-50" />
            <p className="font-semibold text-text-high text-sm">Tidak Ada Pengguna Ditemukan</p>
            <p className="text-xs text-text-muted">
              Coba sesuaikan kata kunci pencarian atau kriteria filter role.
            </p>
          </div>
        )}
      </div>

      {/* Modal Edit Role & Hierarchy Assignment */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 border border-border-subtle shadow-heavy max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                  <ShieldCheck size={18} />
                  <span>Atur Role & Otorisasi Poka-Yoke</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  User: <strong className="text-text-high">{editingUser.nama_lengkap}</strong> ({editingUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-9 h-9 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high min-h-[44px] min-w-[44px]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Select Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Role Hak Akses (RBAC) *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
                >
                  <option value="superadmin">Superadmin (Sinode) - Akses Penuh Nasional</option>
                  <option value="admin_mupel">Admin Mupel - Terkunci 1 Mupel</option>
                  <option value="admin_jemaat">Admin Jemaat / KMJ - Terkunci 1 Jemaat</option>
                  <option value="pj_pos">PJ Pos Pelkes - Terkunci 1 Pos Pelkes</option>
                  <option value="pendeta">Pendeta GPIB</option>
                  <option value="pelayan">Pelayan Field</option>
                  <option value="relawan">Relawan</option>
                </select>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-high">Status Akun Pengguna</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-base text-sm text-text-high focus:outline-none focus:ring-2 focus:ring-brand-primary min-h-[44px]"
                >
                  <option value="Active">Active (Aktif)</option>
                  <option value="Inactive">Inactive (Non-Aktif)</option>
                  <option value="Pending">Pending Verification</option>
                </select>
              </div>

              {/* Dynamic Cascading Selector Based on Role Requirements */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <label className="text-xs font-semibold text-text-high flex items-center justify-between">
                  <span>Penetapan Wilayah Hierarki Poka-Yoke</span>
                  <span className="text-[11px] text-brand-primary font-normal flex items-center gap-1">
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
                    <p className="text-[11px] text-text-muted">
                      Admin Mupel hanya dapat mengakses data dalam Mupel ini.
                    </p>
                  </div>
                ) : formRole === 'admin_jemaat' || formRole === 'pendeta' ? (
                  <div className="space-y-2">
                    <JemaatCascadingSelector
                      value={formInduk}
                      onChange={setFormInduk}
                      defaultIndukId={formInduk || undefined}
                    />
                    <p className="text-[11px] text-text-muted">
                      Admin Jemaat / KMJ terkunci pada Mupel & Jemaat Induk ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <PosCascadingSelector
                      value={formPos}
                      onChange={setFormPos}
                      onJemaatChange={setFormInduk}
                      defaultPosId={formPos || undefined}
                      required={false}
                    />
                    <p className="text-[11px] text-text-muted">
                      PJ / Pelayan / Relawan terkunci pada Mupel, Jemaat, dan Pos Pelkes ini.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-text-high hover:bg-surface-sunken transition-all min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateRoleMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-dark active:scale-95 transition-all shadow-soft min-h-[44px] disabled:opacity-50"
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
