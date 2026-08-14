import { getServerContext } from '@/lib/utils/context';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Search, ChevronRight } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';

export const metadata = {
  title: 'Direktori SDM | SI GPIB',
};

export default async function PeopleDirectoryPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const context = await getServerContext();

  if (!context || context.status === 'UNAUTHORIZED') {
    redirect('/login');
  }

  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || '';
  const selectedType = resolvedParams.type || 'all';

  // 1. Build Query for Downward Reach
  const activeContextId = context.context_id;
  let query = supabase
    .from('m_pendeta')
    .select(`
      id_pendeta,
      id_person,
      nama_lengkap,
      status,
      foto_url,
      id_induk,
      m_jemaat_induk!m_pendeta_id_induk_fkey(id_mupel, nama_induk)
    `);

  // Context-based filtering
  if (activeContextId && !activeContextId.startsWith('SINODE')) {
    if (activeContextId.startsWith('M -') || activeContextId.startsWith('MPL-') || activeContextId.startsWith('M-')) {
      const { data: jmts } = await supabase.from('m_jemaat_induk').select('id_induk, id_mupel');
      const normActive = activeContextId.replace(/[\s\-_]+/g, '').toUpperCase();
      const jmtIds = jmts?.filter(j => (j.id_mupel || '').replace(/[\s\-_]+/g, '').toUpperCase() === normActive).map(j => j.id_induk) || [];
      if (jmtIds.length > 0) {
        query = query.in('id_induk', jmtIds);
      }
    } else if (activeContextId.startsWith('ORG-') || activeContextId.startsWith('JMT-')) {
      query = query.eq('id_induk', activeContextId);
    } else if (activeContextId.startsWith('POS-')) {
      const { data: posObj } = await supabase.from('m_pos_pelkes').select('id_induk').eq('id_pos', activeContextId).maybeSingle();
      if (posObj?.id_induk) {
        query = query.eq('id_induk', posObj.id_induk);
      }
    }
  }

  if (searchQuery) {
    query = query.ilike('nama_lengkap', `%${searchQuery}%`);
  }

  if (selectedType === 'pendeta') {
    query = query.or('status.ilike.%pendeta%,status.ilike.%pdt%');
  } else if (selectedType === 'pelayan') {
    query = query.or('status.ilike.%pelayan%,status.ilike.%pj%');
  } else if (selectedType === 'relawan') {
    query = query.or('status.ilike.%relawan%,status.ilike.%pos%');
  }

  const { data: people, error } = await query.limit(50);

  if (error) {
    console.error('Error fetching people directory:', error);
  }

  const filterChips = [
    { label: 'Semua Kategori', value: 'all' },
    { label: 'Pendeta Organik', value: 'pendeta' },
    { label: 'Pelayan Jemaat', value: 'pelayan' },
    { label: 'Relawan Pos Pelkes', value: 'relawan' },
  ];

  return (
    <div className="w-full min-h-screen bg-surface-base pb-28 pt-1 sm:pt-3">
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Open Canvas Hero */}
        <section className="pt-2 sm:pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <StatusPill variant="gold" dot={true}>
              Sinode GPIB
            </StatusPill>
            <StatusPill variant="blue" dot={false}>
              Pelayanan Terpadu
            </StatusPill>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-ink-primary tracking-tight leading-[1.15]">
              Direktori <span className="font-editorial-italic font-normal text-amber-700 dark:text-amber-400">SDM.</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Katalog sumber daya manusia pelayanan GPIB: pendeta organik, pelayan pos pelkes, dan relawan teritori.
            </p>
          </div>
        </section>

        {/* Search Bar & Fluid Filter Pills */}
        <section className="space-y-3">
          <form className="relative" method="GET" action="/people">
            {selectedType !== 'all' && (
              <input type="hidden" name="type" value={selectedType} />
            )}
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary size-4 pointer-events-none" />
            <input 
              type="text" 
              name="q"
              defaultValue={searchQuery}
              placeholder="Cari nama pendeta, pelayan, atau pos pelayanan..." 
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-ink-primary placeholder:text-ink-tertiary shadow-xs transition-colors min-h-[44px]"
              aria-label="Cari nama pendeta atau pelayan"
            />
          </form>

          {/* Fluid Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filterChips.map((chip) => {
              const isActive = selectedType === chip.value;
              const href = chip.value === 'all' 
                ? (searchQuery ? `/people?q=${encodeURIComponent(searchQuery)}` : '/people')
                : `/people?type=${chip.value}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;

              return (
                <Link
                  key={chip.value}
                  href={href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border min-h-[36px] inline-flex items-center justify-center cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 dark:bg-amber-500 text-white border-amber-600 dark:border-amber-500 shadow-xs'
                      : 'bg-surface-1 text-ink-secondary border-stone-200/70 dark:border-stone-800 hover:border-amber-500/35 hover:text-ink-primary'
                  }`}
                  style={isActive ? { color: '#ffffff' } : undefined}
                >
                  {chip.label}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Full-width List Rows with Hairline Dividers */}
        <section className="bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
          {people && people.length > 0 ? (
            <div className="divide-y divide-stone-200/70 dark:divide-stone-800/80">
              {people.map((person) => {
                const jemaatNama = Array.isArray(person.m_jemaat_induk) 
                  ? person.m_jemaat_induk[0]?.nama_induk 
                  : (person.m_jemaat_induk as any)?.nama_induk || 'Jemaat Induk';

                return (
                  <Link 
                    key={person.id_pendeta} 
                    href={`/people/${encodeURIComponent(person.id_person || person.id_pendeta)}`}
                    className="flex items-center justify-between p-3.5 sm:p-4.5 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors text-left group min-h-[64px]"
                    aria-label={`Lihat profil ${person.nama_lengkap}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="size-11 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 overflow-hidden border border-amber-500/20">
                        {person.foto_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={person.foto_url} alt={person.nama_lengkap} className="size-full object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-ink-primary text-sm line-clamp-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {person.nama_lengkap}
                        </h3>
                        <p className="text-xs text-ink-secondary mt-0.5 truncate flex items-center gap-1.5">
                          <span>{person.status || 'Pendeta Organik'}</span>
                          <span>•</span>
                          <span className="truncate">{jemaatNama}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        Aktif
                      </span>
                      <ChevronRight className="size-4 text-ink-tertiary group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 px-4 text-center">
              <User size={36} className="mx-auto text-ink-tertiary mb-3 opacity-40" />
              <h3 className="text-sm sm:text-base font-bold text-ink-primary">Data SDM Tidak Ditemukan</h3>
              <p className="text-ink-secondary text-xs mt-1 max-w-sm mx-auto">
                {searchQuery 
                  ? `Tidak ada SDM dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                  : 'Belum ada data SDM untuk kategori ini.'}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
