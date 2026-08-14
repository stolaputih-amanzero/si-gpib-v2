'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, 
  ChevronDown, 
  Check, 
  Building2, 
  Search, 
  X, 
  Church, 
  Landmark, 
  Sparkles,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useContextUIStore } from '@/stores/useContextUIStore';
import { switchActiveContextAction } from '@/app/actions/context';

export interface ContextOption {
  id_pos: string;
  nama_pos: string;
  level?: 'MUPEL' | 'JEMAAT' | 'BAJEM' | 'POS';
}

interface ContextSwitcherProps {
  activeContextId: string | null;
  validContexts: ContextOption[];
}

function getContextLevel(ctx: { id_pos?: string; nama_pos?: string; level?: string }): 'POS' | 'BAJEM' | 'JEMAAT' | 'MUPEL' {
  if (ctx.level === 'MUPEL' || ctx.level === 'JEMAAT' || ctx.level === 'BAJEM' || ctx.level === 'POS') {
    return ctx.level;
  }
  const upperId = (ctx.id_pos || '').toUpperCase();
  const lowerName = (ctx.nama_pos || '').toLowerCase();

  if (upperId.startsWith('M -') || upperId.startsWith('MPL-') || upperId.startsWith('MUPEL-') || lowerName.includes('mupel')) {
    return 'MUPEL';
  }
  if (upperId.startsWith('ORG-') || upperId.startsWith('JMT-') || lowerName.includes('jemaat') || lowerName.startsWith('gpib ')) {
    return 'JEMAAT';
  }
  if (upperId.startsWith('BAJEM-') || lowerName.includes('bajem') || lowerName.includes('bakal jemaat')) {
    return 'BAJEM';
  }
  return 'POS';
}

function getLevelConfig(level: 'POS' | 'BAJEM' | 'JEMAAT' | 'MUPEL') {
  switch (level) {
    case 'MUPEL':
      return {
        label: 'Mupel',
        icon: Landmark,
        badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        activeBg: 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/20',
      };
    case 'JEMAAT':
      return {
        label: 'Jemaat',
        icon: Church,
        badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        activeBg: 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/20',
      };
    case 'BAJEM':
      return {
        label: 'Bajem',
        icon: Building2,
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        activeBg: 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20',
      };
    case 'POS':
    default:
      return {
        label: 'Pos Pelkes',
        icon: Building2,
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        activeBg: 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20',
      };
  }
}

export function ContextChip({ activeContextId, validContexts }: ContextSwitcherProps) {
  const { setSwitcherOpen, isSwitcherOpen, optimisticContextId, isSwitching } = useContextUIStore();
  
  const displayId = optimisticContextId || activeContextId;
  const activeContext = validContexts.find(c => c.id_pos === displayId);
  const displayName = activeContext ? activeContext.nama_pos : (displayId || 'Pilih Lokasi Tugas');
  const level = activeContext ? getContextLevel(activeContext) : getContextLevel({ id_pos: displayId || '' });
  const config = getLevelConfig(level);

  return (
    <button
      type="button"
      onClick={() => setSwitcherOpen(true)}
      className="group relative flex items-center gap-2.5 h-10 px-3.5 rounded-full bg-surface-1 hover:bg-surface-sunken border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98 max-w-[280px] sm:max-w-xs text-left"
      title={`Konteks Kerja Aktif: ${displayName}`}
      aria-label="Buka Pengalih Konteks Kerja"
    >
      <div className="size-6 rounded-full flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:scale-105 transition-transform">
        {isSwitching ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <MapPin className="size-3.5" />
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="micro-label text-ink-tertiary leading-none truncate">
          {config.label}
        </span>
        <span className="text-xs font-bold text-ink-primary truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mt-0.5">
          {displayName}
        </span>
      </div>

      <ChevronDown className={`size-4 text-ink-tertiary shrink-0 transition-transform duration-200 ${isSwitcherOpen ? 'rotate-180 text-amber-600' : 'group-hover:translate-y-0.5'}`} />
    </button>
  );
}

export function ContextSwitcherSheet({ activeContextId, validContexts }: ContextSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { isSwitcherOpen, setSwitcherOpen, optimisticContextId, setOptimisticContextId, isSwitching, setSwitching } = useContextUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'POS' | 'BAJEM' | 'JEMAAT' | 'MUPEL'>('ALL');

  // Reset search when modal opens
  useEffect(() => {
    if (isSwitcherOpen) {
      setSearchQuery('');
      setFilterType('ALL');
    }
  }, [isSwitcherOpen]);

  const currentId = optimisticContextId || activeContextId;

  // Filter and categorize list
  const filteredContexts = useMemo(() => {
    return validContexts.filter((ctx) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || ctx.nama_pos.toLowerCase().includes(q) || ctx.id_pos.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (filterType === 'ALL') return true;
      const level = getContextLevel(ctx);
      return level === filterType;
    });
  }, [validContexts, searchQuery, filterType]);

  const handleSelect = async (id: string) => {
    if (id === currentId) {
      setSwitcherOpen(false);
      return;
    }
    
    setOptimisticContextId(id);
    setSwitching(true);
    setSwitcherOpen(false);

    try {
      const formData = new FormData();
      formData.append('contextId', id);
      await switchActiveContextAction(formData);
      
      // Invalidate all react-query caches so client hooks fetch freshly
      await queryClient.invalidateQueries();

      startTransition(() => {
        // Strip any stale context query params (mupel, jemaat, pos) on route
        if (pathname && searchParams) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete('mupel');
          params.delete('jemaat');
          params.delete('pos');
          const newQuery = params.toString();
          router.replace(newQuery ? `${pathname}?${newQuery}` : pathname);
        }
        router.refresh();
      });
    } catch (error) {
      console.error('Failed to switch context', error);
      setOptimisticContextId(null);
    } finally {
      setSwitching(false);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'Semua', count: validContexts.length },
    { key: 'POS', label: 'Pos Pelkes', count: validContexts.filter(c => getContextLevel(c) === 'POS').length },
    { key: 'BAJEM', label: 'Bajem', count: validContexts.filter(c => getContextLevel(c) === 'BAJEM').length },
    { key: 'JEMAAT', label: 'Jemaat', count: validContexts.filter(c => getContextLevel(c) === 'JEMAAT').length },
    { key: 'MUPEL', label: 'Mupel', count: validContexts.filter(c => getContextLevel(c) === 'MUPEL').length },
  ].filter(t => t.key === 'ALL' || t.count > 0);

  return (
    <Dialog open={isSwitcherOpen} onOpenChange={setSwitcherOpen}>
      <DialogContent 
        className="max-w-lg md:max-w-xl w-[94vw] max-h-[85vh] p-0 overflow-hidden bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col"
        showCloseButton={true}
      >
        <DialogTitle className="sr-only">Pilih Konteks Kerja Aktif</DialogTitle>

        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-stone-200/70 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 space-y-4">
          <div className="flex items-center gap-3 pr-6">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-600/20 shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-ink-primary tracking-tight">
                Pilih Konteks Kerja Aktif
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Sesuaikan ruang lingkup data, metrik, dan otoritas operasional.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama pos pelkes, jemaat induk, atau ID..."
              className="w-full pl-10 pr-9 py-2.5 bg-surface-1 border border-stone-200/80 dark:border-stone-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-ink-primary placeholder:text-ink-tertiary shadow-xs transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-primary p-1 rounded-full hover:bg-surface-sunken transition-colors"
                title="Hapus pencarian"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            {tabs.map((tab) => {
              const isActive = filterType === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterType(tab.key as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-surface-1 text-ink-secondary border-stone-200 dark:border-stone-800 hover:bg-surface-sunken hover:text-ink-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-surface-sunken text-ink-tertiary'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Unit List */}
        <div className="p-4 md:p-5 flex-1 overflow-y-auto space-y-2.5 max-h-[48vh] custom-scrollbar">
          {filteredContexts.map((ctx, idx) => {
            const isActive = currentId === ctx.id_pos;
            const level = getContextLevel(ctx);
            const config = getLevelConfig(level);
            const IconComp = config.icon;

            return (
              <button
                key={`${ctx.id_pos}-${idx}`}
                type="button"
                onClick={() => handleSelect(ctx.id_pos)}
                disabled={isPending || isSwitching}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 flex items-center justify-between group cursor-pointer active:scale-[0.99] ${
                  isActive
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/50 shadow-xs ring-1 ring-amber-500/30'
                    : 'bg-surface-1 border-stone-200/70 dark:border-stone-800 hover:border-amber-500/35 hover:bg-surface-sunken'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className={`size-11 rounded-2xl flex items-center justify-center shrink-0 border ${config.iconBg} group-hover:scale-105 transition-transform`}>
                    <IconComp className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-ink-primary group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                        {ctx.nama_pos}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${config.badgeClass}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-ink-tertiary block mt-0.5">
                      ID: {ctx.id_pos}
                    </span>
                  </div>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                    <Check className="size-4" />
                    <span>Aktif</span>
                  </div>
                ) : (
                  <div className="size-7 rounded-xl border border-stone-200 dark:border-stone-800 group-hover:border-amber-500/40 flex items-center justify-center shrink-0 text-ink-tertiary group-hover:text-amber-700 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
                    <ChevronDown className="size-3.5 -rotate-90" />
                  </div>
                )}
              </button>
            );
          })}

          {filteredContexts.length === 0 && (
            <div className="py-14 text-center space-y-2">
              <div className="size-12 rounded-2xl bg-surface-sunken flex items-center justify-center mx-auto text-ink-tertiary">
                <SlidersHorizontal className="size-6 opacity-60" />
              </div>
              <p className="font-editorial text-sm font-bold text-ink-primary">Tidak ada unit ditemukan</p>
              <p className="text-xs text-ink-secondary max-w-xs mx-auto">
                {searchQuery
                  ? `Tidak ada hasil untuk kata kunci "${searchQuery}".`
                  : 'Belum ada data untuk kategori ini.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-5 border-t border-stone-200/70 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/30 flex items-center justify-between text-[11px] text-ink-tertiary">
          <span>Total {filteredContexts.length} unit pelayanan tersedia</span>
          <span className="font-mono">Esc untuk tutup</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
