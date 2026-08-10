'use client';

import { useState } from 'react';
import { UnifiedAssetData } from '@/lib/services/asset';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building, Car, FileText, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';

interface AssetWorkspaceClientProps {
  assetData: UnifiedAssetData;
  contextId: string;
}

export function AssetWorkspaceClient({ assetData }: AssetWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState<'tanah' | 'bangunan' | 'bergerak' | 'legalitas'>('tanah');

  return (
    <div className="flex flex-col min-h-screen bg-bg-base pb-24">
      {/* Header */}
      <header className="bg-bg-surface border-b border-border-subtle pt-12 pb-4 px-4 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Briefcase size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-strong leading-tight">
              {assetData.orgName}
            </h1>
            <p className="text-sm text-text-subtle capitalize">
              Asset Workspace • {assetData.orgLevel}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        {/* KPI Summaries for Higher Levels */}
        {assetData.orgLevel !== 'POS' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="bg-bg-surface border-border-subtle">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <MapPin className="text-brand-primary mb-2" size={24} />
                <span className="text-2xl font-bold text-text-strong">{assetData.summary.totalTanah}</span>
                <span className="text-xs text-text-subtle uppercase tracking-wider">Bidang Tanah</span>
              </CardContent>
            </Card>
            <Card className="bg-bg-surface border-border-subtle">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Building className="text-brand-secondary mb-2" size={24} />
                <span className="text-2xl font-bold text-text-strong">{assetData.summary.totalBangunan}</span>
                <span className="text-xs text-text-subtle uppercase tracking-wider">Bangunan</span>
              </CardContent>
            </Card>
            <Card className="bg-bg-surface border-border-subtle">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Car className="text-brand-tertiary mb-2" size={24} />
                <span className="text-2xl font-bold text-text-strong">{assetData.summary.totalBergerak}</span>
                <span className="text-xs text-text-subtle uppercase tracking-wider">Aset Bergerak</span>
              </CardContent>
            </Card>
            <Card className="bg-bg-surface border-border-subtle">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <FileText className="text-state-info mb-2" size={24} />
                <span className="text-2xl font-bold text-text-strong">{assetData.summary.totalLampiran}</span>
                <span className="text-xs text-text-subtle uppercase tracking-wider">Legalitas</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Child Organizations Drill-down for Higher Levels */}
        {assetData.orgLevel !== 'POS' && assetData.children && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-text-strong uppercase tracking-wider mb-3">Distribusi per Pos Pelkes</h2>
            <div className="space-y-2">
              {assetData.children.map(child => (
                <Link href={`/assets/${child.id}`} key={child.id}>
                  <Card className="bg-bg-surface border-border-subtle active:scale-[0.98] transition-transform">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-text-strong">{child.name}</h3>
                        <p className="text-xs text-text-subtle mt-1 flex gap-3">
                          <span>{child.stats.tanah} Tanah</span>
                          <span>{child.stats.bangunan} Bgn</span>
                          <span>{child.stats.bergerak} Kendaraan</span>
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-text-muted" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Horizontal Tabs for Sections */}
        <div className="mb-6 overflow-x-auto no-scrollbar border-b border-border-subtle">
          <div className="flex gap-6 w-max px-1">
            {[
              { id: 'tanah', label: 'Tanah', icon: MapPin },
              { id: 'bangunan', label: 'Bangunan', icon: Building },
              { id: 'bergerak', label: 'Bergerak', icon: Car },
              { id: 'legalitas', label: 'Legalitas', icon: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 flex items-center gap-2 text-sm font-medium transition-colors relative whitespace-nowrap
                  ${activeTab === tab.id ? 'text-brand-primary' : 'text-text-subtle hover:text-text-strong'}`}
              >
                <tab.icon size={16} />
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section Contents */}
        <div className="space-y-4">
          {activeTab === 'tanah' && (
            <div>
              {assetData.tanah.length === 0 ? (
                <EmptyState icon={MapPin} title="Belum ada data tanah" />
              ) : (
                assetData.tanah.map(item => (
                  <Card key={item.id_tanah} className="mb-3 bg-bg-surface border-border-subtle">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-text-strong">{item.m_pos_pelkes?.nama_pos || assetData.orgName}</h3>
                        <span className="text-xs font-medium bg-brand-primary/10 text-brand-primary px-2 py-1 rounded">Tanah</span>
                      </div>
                      <p className="text-sm text-text-muted mb-1">Luas: {formatNumber(item.luas_m2)} m²</p>
                      <p className="text-sm text-text-muted">Status: {item.status_hukum}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'bangunan' && (
            <div>
              {assetData.bangunan.length === 0 ? (
                <EmptyState icon={Building} title="Belum ada data bangunan" />
              ) : (
                assetData.bangunan.map(item => (
                  <Card key={item.id_bangunan} className="mb-3 bg-bg-surface border-border-subtle">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-text-strong">{item.m_pos_pelkes?.nama_pos || assetData.orgName}</h3>
                        <span className="text-xs font-medium bg-brand-secondary/10 text-brand-secondary px-2 py-1 rounded">Bangunan</span>
                      </div>
                      <p className="text-sm text-text-muted mb-1">Fungsi: {item.fungsi}</p>
                      <p className="text-sm text-text-muted">Kondisi: {item.kondisi}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'bergerak' && (
            <div>
              {assetData.bergerak.length === 0 ? (
                <EmptyState icon={Car} title="Belum ada data aset bergerak" />
              ) : (
                assetData.bergerak.map(item => (
                  <Card key={item.id_aset_b} className="mb-3 bg-bg-surface border-border-subtle">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-text-strong">{item.m_pos_pelkes?.nama_pos || assetData.orgName}</h3>
                        <span className="text-xs font-medium bg-brand-tertiary/10 text-brand-tertiary px-2 py-1 rounded">Bergerak</span>
                      </div>
                      <p className="text-sm text-text-muted mb-1">{item.jenis} - {item.merk_tipe}</p>
                      {item.no_polisi && <p className="text-sm text-text-muted font-mono">{item.no_polisi}</p>}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'legalitas' && (
            <div>
              <EmptyState icon={FileText} title="Dokumen legalitas terintegrasi" subtitle="Fase dokumentasi akan dirilis pada Gate berikutnya." />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-bg-surface border border-dashed border-border-subtle rounded-xl">
      <div className="w-12 h-12 bg-bg-base rounded-full flex items-center justify-center text-text-muted mb-3">
        <Icon size={24} />
      </div>
      <h3 className="font-medium text-text-strong mb-1">{title}</h3>
      <p className="text-sm text-text-subtle">{subtitle || 'Tidak ada data untuk kategori ini'}</p>
    </div>
  );
}
