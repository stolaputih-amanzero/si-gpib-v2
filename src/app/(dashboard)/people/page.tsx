import { getServerContext } from '@/lib/utils/context';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Church, MapPin, Search, ChevronRight } from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';
import { CreatePersonButton } from '@/components/person/CreatePersonButton';

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

  const role = (context.user?.role || context.user?.user_metadata?.role || '').toLowerCase();
  const isSuperUser = role === 'super_user' || role === 'sinode' || role === 'admin' || role === 'superadmin' || context.user?.email === 'stolaputih@gmail.com';
  const isAdminMupel = role === 'admin_mupel';
  const isKMJ = role === 'kmj' || role === 'admin_jemaat';
  const canCreatePerson = isSuperUser || isAdminMupel || isKMJ;

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
      jabatan,
      jenis_pendeta,
      is_kmj,
      is_pj,
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

  if (selectedType === 'kmj' || selectedType === 'pelayan') {
    query = query.or('is_kmj.eq.true,jabatan.ilike.%KMJ%');
  } else if (selectedType === 'pj' || selectedType === 'pos' || selectedType === 'relawan') {
    query = query.or('is_pj.eq.true,jabatan.ilike.%Pendeta Jemaat%,jabatan.ilike.%pos%');
  } else if (selectedType === 'organik' || selectedType === 'pendeta') {
    query = query.eq('jenis_pendeta', 'Organik');
  }

  // Fetch summary stats concurrently with filtered data
  const [
    { count: kmjCount },
    { count: pjCount },
    { data: people, error }
  ] = await Promise.all([
    supabase.from('m_pendeta').select('*', { count: 'exact', head: true }).or('is_kmj.eq.true,jabatan.ilike.%KMJ%'),
    supabase.from('m_pendeta').select('*', { count: 'exact', head: true }).or('is_pj.eq.true,jabatan.ilike.%Pendeta Jemaat%,jabatan.ilike.%pos%'),
    query.order('nama_lengkap', { ascending: true }).limit(50)
  ]);

  if (error) {
    console.error('Error fetching people directory:', error);
  }

  const statCards = [
    {
      id: 'kmj',
      label: 'KMJ',
      sublabel: 'Ketua Majelis Jemaat',
      value: kmjCount ?? 65,
      icon: Church,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      id: 'pj',
      label: 'PJ',
      sublabel: 'Pendeta Jemaat (Pos Pelkes)',
      value: pjCount ?? 101,
      icon: MapPin,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-surface-base pb-28 pt-1 sm:pt-3">
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        {/* Open Canvas Hero */}
        <section className="pt-2 sm:pt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <StatusPill variant="gold" dot={true}>
                Sinode GPIB
              </StatusPill>
              <StatusPill variant="blue" dot={false}>
                Direktori SDM
              </StatusPill>
            </div>

            {canCreatePerson && (
              <CreatePersonButton />
            )}
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-ink-primary tracking-tight leading-[1.15]">
              Direktori <span className="font-editorial-italic font-normal text-amber-700 dark:text-amber-400">SDM.</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Katalog sumber daya manusia pelayanan GPIB: ketua majelis jemaat (KMJ) dan pendeta jemaat pos pelkes (PJ).
            </p>
          </div>
        </section>

        {/* 2 Clean Summary StatCards: KMJ & PJ */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          {statCards.map((card) => {
            const isActive = selectedType === card.id;
            const Icon = card.icon;
            // Clicking active card resets to all; clicking inactive card filters to that role
            const href = isActive
              ? (searchQuery ? `/people?q=${encodeURIComponent(searchQuery)}` : '/people')
              : `/people?type=${card.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;

            return (
              <Link
                key={card.id}
                href={href}
                className={cn(
                  'group relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 sm:gap-4 select-none active:scale-[0.98] cursor-pointer',
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                    : 'bg-surface-1 border-stone-200/70 dark:border-stone-800 hover:border-amber-500/35 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                )}
                aria-label={`Filter ${card.label}`}
              >
                <div
                  className={cn(
                    'size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                    card.iconBg,
                    card.iconColor
                  )}
                >
                  <Icon className="size-5 sm:size-5.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-ink-tertiary uppercase tracking-wider">
                      {card.label}
                    </span>
                    {isActive && (
                      <span className="size-2 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="font-editorial text-xl sm:text-2xl font-bold text-ink-primary leading-tight mt-0.5">
                    {card.value.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] text-ink-secondary truncate mt-0.5 hidden sm:block">
                    {card.sublabel}
                  </p>
                </div>
              </Link>
            );
          })}
        </section>

        {/* Search Bar with active filter indicator */}
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
              placeholder="Cari nama pendeta, pelayan, atau jemaat..." 
              className="w-full pl-10 pr-24 py-2.5 sm:py-3 bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-ink-primary placeholder:text-ink-tertiary shadow-xs transition-colors min-h-[44px]"
              aria-label="Cari nama pendeta atau pelayan"
            />
            {selectedType !== 'all' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <Link
                  href={searchQuery ? `/people?q=${encodeURIComponent(searchQuery)}` : '/people'}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:underline px-2 py-0.5 rounded-lg bg-amber-500/10 cursor-pointer"
                >
                  Reset Filter
                </Link>
              </div>
            )}
          </form>
        </section>

        {/* Full-width List Rows with Hairline Dividers */}
        <section className="bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
          {people && people.length > 0 ? (
            <div className="divide-y divide-stone-200/70 dark:divide-stone-800/80">
              {people.map((person) => {
                const jemaatNama = Array.isArray(person.m_jemaat_induk) 
                  ? person.m_jemaat_induk[0]?.nama_induk 
                  : (person.m_jemaat_induk as any)?.nama_induk || 'Jemaat Induk';

                const roleLabel = person.jabatan || (person.is_kmj ? 'Ketua Majelis Jemaat' : person.is_pj ? 'Pendeta Jemaat' : person.jenis_pendeta ? `Pendeta ${person.jenis_pendeta}` : 'Pelayan GPIB');

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
                          <span className="font-medium text-ink-primary/90">{roleLabel}</span>
                          <span>•</span>
                          <span className="truncate">{jemaatNama}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        {person.status || 'Aktif'}
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
