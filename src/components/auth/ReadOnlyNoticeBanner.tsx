'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { MessageCircle, ShieldAlert } from 'lucide-react';

export function ReadOnlyNoticeBanner() {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser || currentUser.role !== 'read_only') {
    return null;
  }

  const waMessage = encodeURIComponent(
    `Halo Admin SI GPIB, saya baru saja mendaftar akun (${currentUser.email}) dan memohon penetapan role/akses definitif.`
  );
  const waUrl = `https://wa.me/62859106811190?text=${waMessage}`;

  return (
    <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-md backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                Akses Terbatas (Read Only)
              </span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base leading-snug">
              Akun Anda Memerlukan Penetapan Peran (Role)
            </h3>
            <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90 mt-0.5">
              Sebagai pengguna baru, akun Anda mendapatkan role temporer <strong>Read Only</strong>. Super User / Super Admin perlu meng-assign role definitif untuk membuka akses penuh.
            </p>
          </div>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-md shrink-0 border border-emerald-500/30"
        >
          <MessageCircle size={18} />
          <span>Hubungi Admin via WA (0859106811190)</span>
        </a>
      </div>
    </div>
  );
}
