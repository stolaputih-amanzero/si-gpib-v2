import { getServerContext } from '@/lib/utils/context';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Search, ChevronRight } from 'lucide-react';

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
    { label: 'Semua', value: 'all' },
    { label: 'Pendeta', value: 'pendeta' },
    { label: 'Pelayan', value: 'pelayan' },
    { label: 'Relawan', value: 'relawan' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-high tracking-tight">
          Direktori SDM
        </h1>
        <p className="text-xs md:text-sm text-text-muted mt-1">
          Katalog SDM pelayanan GPIB: pendeta, pelayan jemaat, dan relawan.
        </p>
      </div>

      {/* Search Bar */}
      <form className="relative" method="GET" action="/people">
        {selectedType !== 'all' && (
          <input type="hidden" name="type" value={selectedType} />
        )}
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
        <input 
          type="text" 
          name="q"
          defaultValue={searchQuery}
          placeholder="Cari nama pendeta atau pelayan..." 
          className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-text-high placeholder:text-text-muted/60 shadow-xs transition-colors min-h-[44px]"
          aria-label="Cari nama pendeta atau pelayan"
        />
      </form>

      {/* ONTOLOGY CORRECTION (Guardrail 1): Ministry Identity Filters (Entity Attribute Filters) */}
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border min-h-[36px] inline-flex items-center justify-center ${
                isActive
                  ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                  : 'bg-surface-elevated text-text-muted border-border-subtle hover:bg-surface-sunken hover:text-text-high'
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      {/* Full-width List Rows with Hairline Dividers */}
      <div className="bg-surface-elevated border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
        {people && people.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {people.map((person) => {
              const jemaatNama = Array.isArray(person.m_jemaat_induk) 
                ? person.m_jemaat_induk[0]?.nama_induk 
                : (person.m_jemaat_induk as any)?.nama_induk || 'Jemaat Induk';

              return (
                <Link 
                  key={person.id_pendeta} 
                  href={`/people/${encodeURIComponent(person.id_person || person.id_pendeta)}`}
                  className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-surface-sunken transition-colors text-left group min-h-[64px]"
                  aria-label={`Lihat profil ${person.nama_lengkap}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div className="w-11 h-11 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 overflow-hidden border border-brand-primary/20">
                      {person.foto_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={person.foto_url} alt={person.nama_lengkap} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-text-high text-sm line-clamp-2 group-hover:text-brand-primary transition-colors">
                        {person.nama_lengkap}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 truncate flex items-center gap-1.5">
                        <span>{person.status || 'Pendeta Organik'}</span>
                        <span>•</span>
                        <span className="truncate">{jemaatNama}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      Aktif
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-12 px-4 text-center">
            <User size={40} className="mx-auto text-text-muted mb-3 opacity-40" />
            <h3 className="text-base font-bold text-text-high">Data SDM Tidak Ditemukan</h3>
            <p className="text-text-muted text-xs mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? `Tidak ada SDM dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : 'Belum ada data SDM untuk kategori ini.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
