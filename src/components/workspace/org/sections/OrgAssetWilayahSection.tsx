import { LegacyUnifiedOrganizationData } from '../legacyTypes';
import { useState } from 'react';
import { Building2, Map, TriangleAlert, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export function OrgAssetWilayahSection({ orgData }: { orgData: LegacyUnifiedOrganizationData }) {
  const [activeTab, setActiveTab] = useState<'tanah' | 'bangunan' | 'bergerak' | 'peta'>('tanah');
  
  const assets: any[] = orgData.assets || [];
  const wilayah: any[] = orgData.wilayah || [];

  const tanah = assets.filter((a: any) => a.category === 'TANAH');
  const bangunan = assets.filter((a: any) => a.category === 'BANGUNAN');
  const bergerak = assets.filter((a: any) => a.category === 'BERGERAK');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const renderAssetList = (list: any[], emptyMsg: string) => {
    if (list.length === 0) {
      return (
        <div className="p-8 text-center bg-surface-1 border border-border-subtle rounded-2xl">
          <Building2 size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
          <h3 className="font-medium text-text-strong">{emptyMsg}</h3>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {list.map((a: any) => (
          <Link href={`/dashboard/assets/${a.id}`} key={a.id} className="block">
            <div className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs hover:border-brand-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-text-strong">{a.name}</h4>
              {a.value != null && (
                <span className="text-sm font-bold text-brand-primary">{formatCurrency(a.value)}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(a.legal_status || a.condition) && (
                <span className="bg-surface-sunken text-text-muted text-xs px-2 py-1 rounded-md">
                  {a.legal_status || a.condition}
                </span>
              )}
              {a.acquisition_date && (
                <span className="bg-surface-sunken text-text-muted text-xs px-2 py-1 rounded-md">
                  Perolehan: {format(new Date(a.acquisition_date), 'yyyy')}
                </span>
              )}
            </div>
          </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-tab-fade pb-8">
      {/* Segmented Control */}
      <div className="flex overflow-x-auto hide-scrollbar bg-surface-sunken p-1 rounded-xl">
        {['tanah', 'bangunan', 'bergerak', 'peta'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-none min-w-[80px] px-3 text-sm font-medium py-2 rounded-lg transition-colors ${
              activeTab === tab ? 'bg-surface-1 shadow-sm text-text-strong' : 'text-text-muted hover:text-text-main'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'tanah' && renderAssetList(tanah, 'Belum ada data aset tanah')}
      {activeTab === 'bangunan' && renderAssetList(bangunan, 'Belum ada data aset bangunan')}
      {activeTab === 'bergerak' && renderAssetList(bergerak, 'Belum ada data aset bergerak')}

      {activeTab === 'peta' && (
        <div className="space-y-4">
          <div className="bg-surface-1 rounded-2xl p-4 border border-border-subtle shadow-2xs flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <Map size={32} className="mx-auto text-text-muted mb-3 opacity-20" />
              <p className="text-sm font-medium text-text-strong">Peta Wilayah Interaktif</p>
              <p className="text-xs text-text-muted mt-1">(Komponen Map akan dirender di sini)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {wilayah.map((w: any) => (
              <div key={w.id} className="bg-surface-1 border border-border-subtle rounded-2xl p-4 shadow-2xs flex gap-3 items-start">
                {w.type === 'RISIKO' ? (
                  <TriangleAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-text-strong">{w.name}</h4>
                  <p className="text-xs text-text-muted mt-0.5 uppercase tracking-wide font-medium">{w.category}</p>
                  {w.description && <p className="text-sm text-text-muted mt-2">{w.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
