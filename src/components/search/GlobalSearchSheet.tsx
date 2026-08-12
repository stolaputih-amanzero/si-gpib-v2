'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, User, Package, ArrowRight } from 'lucide-react';
import { haptic } from '@/lib/haptic/vibrate';

const MOCK_SEARCH_DATABASE = [
  // Entities
  { type: 'ENTITY', category: 'Person (SDM)', title: 'Pdt. Markus S.Th', id: '82e47866-ddf2-4e11-9146-76dd5abb8155', route: '/people/82e47866-ddf2-4e11-9146-76dd5abb8155', subtitle: 'KMJ GPIB Immanuel' },
  { type: 'ENTITY', category: 'Person (SDM)', title: 'Pnt. Yohanis Baluka', id: '07-12-AS', route: '/people/07-12-AS', subtitle: 'Presbiter - Pos Lahai Roi' },
  { type: 'ENTITY', category: 'Organisasi', title: 'GPIB Jemaat Immanuel Palu', id: 'GPIB-IMP', route: '/org/GPIB-IMP', subtitle: 'Jemaat Induk' },
  { type: 'ENTITY', category: 'Organisasi', title: 'Pos Pelkes Lahai Roi', id: '07-12-AS', route: '/org/07-12-AS', subtitle: 'Pos Pelkes' },

  // Transactions
  { type: 'TRANSACTION', category: 'Pengajuan Bantuan', title: 'Bantuan Bencana Alam (AJ-2026-001)', id: 'AJ-2026-001', route: '/aid-requests/AJ-2026-001', subtitle: 'Pos Lahai Roi • Pending KMJ' },
  { type: 'TRANSACTION', category: 'Aset Organisasi', title: 'Lahan Gereja Pos Lahai Roi (AST-001)', id: 'AST-001', route: '/assets/AST-001', subtitle: 'Tanah 1.500m² • SHM' },
];

export function GlobalSearchSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleOpen = () => {
    haptic.selection();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  const results = query.trim() === ''
    ? MOCK_SEARCH_DATABASE
    : MOCK_SEARCH_DATABASE.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
      );

  const entityResults = results.filter(r => r.type === 'ENTITY');
  const transactionResults = results.filter(r => r.type === 'TRANSACTION');

  const handleSelectResult = (route: string) => {
    haptic.medium();
    handleClose();
    // PR-06 Navigation
    router.push(route);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shrink-0 border border-border-subtle"
        aria-label="Cari global di aplikasi"
        title="Pencarian Global"
      >
        <Search className="w-4 h-4 text-blue-400" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-start animate-in fade-in duration-200 p-4">
          <div className="max-w-2xl mx-auto w-full bg-slate-900 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mt-12">
            {/* Header Search Bar */}
            <div className="p-4 border-b border-border-subtle flex items-center gap-3 bg-slate-950">
              <Search className="w-5 h-5 text-blue-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Cari SDM, Organisasi, Pengajuan Bantuan, Aset..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none"
              />
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Grouped by Canonical Class */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1">
              {/* Group 1: Entities (SDM & Org Workspaces) */}
              {entityResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Entitas (Person &amp; Organization Workspaces)</span>
                  </h4>
                  <div className="space-y-1.5">
                    {entityResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.route)}
                        className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-border-subtle cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-100 text-xs group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 2: Transactions (Aid Requests & Assets) */}
              {transactionResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-400" />
                    <span>Transaksi &amp; Aset (Aid Requests &amp; Asset Intelligence)</span>
                  </h4>
                  <div className="space-y-1.5">
                    {transactionResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.route)}
                        className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-border-subtle cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-100 text-xs group-hover:text-purple-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.length === 0 && (
                <p className="text-center text-xs italic text-slate-500 py-8">
                  Tidak ada hasil pencarian untuk "{query}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
