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
      className="group relative flex items-center gap-2.5 h-10 px-3.5 rounded-2xl bg-surface-elevated hover:bg-surface-sunken border border-border-subtle hover:border-brand-primary/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98 max-w-[280px] sm:max-w-xs text-left"
      title={`Konteks Kerja Aktif: ${displayName}`}
      aria-label="Buka Pengalih Konteks Kerja"
    >
      <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 border ${config.iconBg} group-hover:scale-105 transition-transform`}>
        {isSwitching ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <MapPin className="w-3.5 h-3.5" />
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none truncate">
          {config.label}
        </span>
        <span className="text-xs font-bold text-text-high truncate group-hover:text-brand-primary transition-colors mt-0.5">
          {displayName}
        </span>
      </div>

      <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${isSwitcherOpen ? 'rotate-180 text-brand-primary' : 'group-hover:translate-y-0.5'}`} />
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
        className="max-w-lg md:max-w-xl w-[94vw] max-h-[85vh] p-0 overflow-hidden bg-surface-elevated border border-border-subtle rounded-3xl shadow-2xl flex flex-col"
        showCloseButton={true}
      >
        <DialogTitle className="sr-only">Pilih Konteks Kerja Aktif</DialogTitle>

        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-border-subtle/80 bg-surface-sunken/40 space-y-4">
          <div className="flex items-center gap-3 pr-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-primary/70 text-white flex items-center justify-center shadow-md shadow-brand-primary/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-text-high tracking-tight">
                Pilih Konteks Kerja Aktif
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Sesuaikan ruang lingkup data, metrik, dan otoritas operasional.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama pos pelkes, jemaat induk, atau ID..."
              className="w-full pl-10 pr-9 py-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-text-high placeholder:text-text-muted shadow-xs transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-high p-1 rounded-full hover:bg-surface-sunken transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                    isActive
                      ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                      : 'bg-surface-elevated text-text-muted border-border-subtle hover:bg-surface-sunken hover:text-text-high'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-surface-sunken text-text-muted'}`}>
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
                    ? 'bg-brand-primary/10 border-brand-primary/50 shadow-xs ring-1 ring-brand-primary/20'
                    : 'bg-surface-elevated border-border-subtle hover:border-brand-primary/40 hover:bg-surface-sunken'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${config.iconBg} group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-text-high group-hover:text-brand-primary transition-colors truncate">
                        {ctx.nama_pos}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${config.badgeClass}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-text-muted block mt-0.5">
                      ID: {ctx.id_pos}
                    </span>
                  </div>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary shrink-0 bg-brand-primary/15 px-3 py-1 rounded-full border border-brand-primary/30">
                    <Check className="w-4 h-4" />
                    <span>Aktif</span>
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl border border-border-subtle group-hover:border-brand-primary/40 flex items-center justify-center shrink-0 text-text-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all">
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </div>
                )}
              </button>
            );
          })}

          {filteredContexts.length === 0 && (
            <div className="py-14 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-surface-sunken flex items-center justify-center mx-auto text-text-muted">
                <SlidersHorizontal className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-sm font-bold text-text-high">Tidak ada unit ditemukan</p>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                {searchQuery
                  ? `Tidak ada hasil untuk kata kunci "${searchQuery}".`
                  : 'Belum ada data untuk kategori ini.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-5 border-t border-border-subtle/70 bg-surface-sunken/30 flex items-center justify-between text-[11px] text-text-muted">
          <span>Total {filteredContexts.length} unit pelayanan tersedia</span>
          <span className="font-mono">Esc untuk tutup</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
