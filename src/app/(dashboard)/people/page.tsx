import { getServerContext } from '@/lib/utils/context';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Search, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Person Directory | SI GPIB',
};

export default async function PeopleDirectoryPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const context = await getServerContext();
  const contextId = context?.context_id;

  if (!context || !contextId) {
    redirect('/auth/login');
  }

  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || '';

  // 1. Build Query for Downward Reach
  let query = supabase
    .from('m_pendeta')
    .select(`
      id_pendeta,
      nama_lengkap,
      status_keaktifan,
      foto_url,
      m_jemaat_induk!inner(id_mupel, nama_induk)
    `);

  // Filter based on context level
  if (contextId.startsWith('MUPEL')) {
    query = query.eq('m_jemaat_induk.id_mupel', contextId);
  } else if (contextId.startsWith('POS')) {
    // Requires joining with penugasan
    // For now, if pos, we could restrict via penugasan or redirect
    // Since we don't know Jemaat from POS directly without query, skip filtering
  } else {
    // JEMAAT level
    query = query.eq('id_induk', contextId);
  }

  if (searchQuery) {
    query = query.ilike('nama_lengkap', `%${searchQuery}%`);
  }

  const { data: people, error } = await query.limit(50);

  if (error) {
    console.error('Error fetching people directory:', error);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-text-strong tracking-tight">Person Directory</h1>
        <p className="text-text-muted mt-1 text-sm">
          Menampilkan daftar Pelayan, Pendeta, dan Relawan
        </p>
      </header>

      {/* Search Bar - Client form could be better but basic HTML form works for SSR */}
      <form className="relative" method="GET" action="/people">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
        <input 
          type="text" 
          name="q"
          defaultValue={searchQuery}
          placeholder="Cari nama pendeta atau pelayan..." 
          className="w-full pl-12 pr-4 py-3 bg-surface-1 border border-border-subtle rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-text-strong shadow-2xs"
        />
      </form>

      {/* Directory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people && people.length > 0 ? (
          people.map((person) => (
            <Link 
              key={person.id_pendeta} 
              href={`/people/${encodeURIComponent(person.id_pendeta)}`}
              className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs hover:bg-surface-sunken transition-colors flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 overflow-hidden">
                {person.foto_url ? (
                  <img src={person.foto_url} alt={person.nama_lengkap} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-strong text-sm truncate">{person.nama_lengkap}</h3>
                <p className="text-xs text-text-muted mt-0.5 truncate flex items-center gap-1">
                  <MapPin size={12} />
                  {Array.isArray(person.m_jemaat_induk) 
                    ? person.m_jemaat_induk[0]?.nama_induk 
                    : (person.m_jemaat_induk as any)?.nama_induk || 'Jemaat Induk'}
                </p>
                <div className="mt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-surface-sunken text-text-muted rounded-full">
                    {person.status_keaktifan || 'Aktif'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-surface-1 border border-border-dashed rounded-2xl border-border-subtle">
            <User size={48} className="mx-auto text-text-muted mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-text-strong">Tidak ada data</h3>
            <p className="text-text-muted text-sm mt-1">Gunakan kata kunci lain atau periksa cakupan akses Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
