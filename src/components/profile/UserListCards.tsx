'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Users } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import { useUsersList, UserManagementItem } from '@/hooks/use-users-management';

export function UserListCards() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: usersList, isLoading } = useUsersList(searchQuery, roleFilter);

  return (
    <div className="space-y-4">
      {/* Search and Role Filter Bar */}
      <div className="card-flat p-4 space-y-3 bg-surface-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" size={18} />
            <input
              type="text"
              placeholder="Cari nama, email, Mupel, Jemaat, Pos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field pl-10 pr-4"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="field font-semibold"
            >
              <option value="all">Semua Role</option>
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

      {/* Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-flat p-4 h-28 skeleton" />
          ))}
        </div>
      ) : usersList && usersList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {usersList.map((user: UserManagementItem) => {
            const contextLine =
              user.pos_pelkes?.nama_pos ||
              user.jemaat_induk?.nama_induk ||
              user.mupel?.nama_mupel ||
              'Akses Umum / Nasional';

            return (
              <Link
                key={user.id}
                href={`/settings/users/${user.id}`}
                className="card-flat p-4 flex items-center justify-between gap-3 hover:border-brand-500/50 hover:bg-surface-sunken transition-all tap group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-surface-brand text-brand-600 font-display font-bold text-lg flex items-center justify-center shrink-0 border border-brand-500/20 shadow-2xs">
                    {user.nama_lengkap.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-ink-primary truncate group-hover:text-brand-600 transition-colors">
                        {user.nama_lengkap}
                      </h3>
                      <RoleBadge role={user.role} />
                    </div>

                    <p className="text-xs text-ink-tertiary truncate font-mono">{user.email}</p>
                    <p className="text-[11px] font-medium text-brand-600 truncate">{contextLine}</p>
                  </div>
                </div>

                <ChevronRight size={18} className="text-ink-tertiary group-hover:text-brand-600 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card-flat p-8 text-center space-y-2">
          <Users size={36} className="mx-auto text-ink-tertiary opacity-50" />
          <p className="font-semibold text-ink-primary text-sm">Tidak Ada Pengguna Ditemukan</p>
          <p className="text-xs text-ink-tertiary">
            Coba sesuaikan kata kunci pencarian atau filter role.
          </p>
        </div>
      )}
    </div>
  );
}
