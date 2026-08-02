'use client';

import Link from 'next/link';
import { ShieldCheck, ChevronRight, Phone, Mail, UserCheck } from 'lucide-react';
import { AdminMupelUser } from '@/hooks/use-admin-mupel';
import { cn } from '@/lib/utils';

export interface AdminMupelBlockProps {
  admins?: AdminMupelUser[];
  className?: string;
}

export function AdminMupelBlock({ admins = [], className }: AdminMupelBlockProps) {
  return (
    <section className={cn('bg-surface-1 border border-border-subtle rounded-2xl overflow-hidden shadow-2xs divide-y divide-line-hairline', className)}>
      {/* Subjudul Kepemimpinan Administrative */}
      <div className="px-4 py-3 bg-surface-sunken/40 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-primary" />
          <span>Administrasi & Kepemimpinan Mupel</span>
        </h2>
        <span className="text-[10px] font-bold text-text-tertiary">Admin ({admins.length})</span>
      </div>

      {/* Admin Mupel List (1:N) */}
      <div className="p-4 space-y-3">
        {admins.length === 0 ? (
          <div className="p-3.5 bg-surface-sunken/50 rounded-xl border border-border-subtle/50 text-xs text-text-tertiary italic flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-text-tertiary shrink-0" />
            <span>Belum ada Admin Mupel terdaftar di wilayah ini.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {admins.map((admin) => (
              <Link
                key={admin.id}
                href={`/settings/users/${encodeURIComponent(admin.id)}`}
                className="tap flex items-center justify-between p-3.5 rounded-xl bg-surface-brand/10 hover:bg-surface-brand/20 transition-colors group cursor-pointer border border-brand-primary/20"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {admin.foto_url ? (
                    <img
                      src={admin.foto_url}
                      alt={admin.nama_lengkap}
                      className="w-11 h-11 rounded-xl object-cover border border-brand-primary/30 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-base shrink-0 shadow-2xs">
                      <ShieldCheck className="w-5.5 h-5.5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-text-high truncate group-hover:text-brand-primary transition-colors">
                        {admin.nama_lengkap}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-primary text-white shadow-2xs">
                        Admin Mupel
                      </span>
                    </div>

                    <div className="text-xs text-text-muted flex items-center gap-3 flex-wrap">
                      {admin.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-brand-primary" />
                          <span className="truncate">{admin.email}</span>
                        </span>
                      )}
                      {admin.no_wa && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono">
                          <Phone size={12} />
                          <span>{admin.no_wa}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-brand-primary group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminMupelBlock;
