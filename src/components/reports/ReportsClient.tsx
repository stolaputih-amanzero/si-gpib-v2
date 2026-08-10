'use client';

import { useState } from 'react';
import { ConsolidatedReportData } from '@/lib/services/reports';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, ShieldAlert, HandHeart, Users, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ReportsClientProps {
  initialData: ConsolidatedReportData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ReportsClient({ initialData }: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<'pastoral' | 'aset' | 'demografi' | 'bantuan' | 'wilayah'>('pastoral');
  const router = useRouter();

  const handleBarClick = (data: any) => {
    if (data && data.drillDownId) {
      router.push(`/org/${data.drillDownId}`);
    }
  };

  const renderPastoral = () => {
    const { totalJiwa, totalKegiatan, kegiatanByPos } = initialData.pastoral;
    if (totalKegiatan === 0) return <div className="p-8 text-center text-text-muted italic">Tidak ada data pastoral.</div>;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl">
            <p className="text-sm text-text-subtle font-medium">Total Jiwa Dilayani</p>
            <p className="text-2xl font-bold text-text-strong">{totalJiwa}</p>
          </div>
          <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl">
            <p className="text-sm text-text-subtle font-medium">Total Kegiatan</p>
            <p className="text-2xl font-bold text-text-strong">{totalKegiatan}</p>
          </div>
        </div>
        <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl h-64">
          <h3 className="text-sm font-bold mb-4">Kegiatan per Pos Pelkes</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kegiatanByPos}>
              <XAxis dataKey="label" fontSize={10} tickFormatter={(val) => val.replace('POS-', '')} />
              <YAxis fontSize={10} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} onClick={handleBarClick} className="cursor-pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderAset = () => {
    const { totalAset, kondisi } = initialData.aset;
    if (totalAset === 0) return <div className="p-8 text-center text-text-muted italic">Tidak ada data aset.</div>;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl">
            <p className="text-sm text-text-subtle font-medium">Total Item Aset Terdata</p>
            <p className="text-2xl font-bold text-text-strong">{totalAset}</p>
          </div>
        </div>
        <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl h-64 flex flex-col">
          <h3 className="text-sm font-bold mb-4">Kondisi Aset</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={kondisi} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                {kondisi.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderDemografi = () => {
    const { totalJiwa, pelkat } = initialData.demografi;
    if (totalJiwa === 0) return <div className="p-8 text-center text-text-muted italic">Tidak ada data demografi.</div>;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl">
            <p className="text-sm text-text-subtle font-medium">Total Jemaat (Agregat Demografi)</p>
            <p className="text-2xl font-bold text-text-strong">{totalJiwa}</p>
          </div>
        </div>
        <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl h-64">
          <h3 className="text-sm font-bold mb-4">Distribusi Pelkat</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pelkat}>
              <XAxis dataKey="label" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBantuan = () => {
    const { status, totalNominal } = initialData.bantuan;
    if (status.length === 0) return <div className="p-8 text-center text-text-muted italic">Tidak ada data pengajuan bantuan.</div>;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl">
            <p className="text-sm text-text-subtle font-medium">Total Estimasi Nominal (Rp)</p>
            <p className="text-2xl font-bold text-text-strong">
              {new Intl.NumberFormat('id-ID').format(totalNominal)}
            </p>
          </div>
        </div>
        <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl h-64">
          <h3 className="text-sm font-bold mb-4">Status Pengajuan</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={status} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                {status.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderWilayah = () => {
    const { kerawanan, potensi } = initialData.wilayah;
    if (kerawanan.length === 0 && potensi.length === 0) return <div className="p-8 text-center text-text-muted italic">Tidak ada data risiko atau potensi.</div>;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl h-64">
          <h3 className="text-sm font-bold mb-4">Kerawanan Wilayah</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kerawanan} layout="vertical">
              <XAxis type="number" fontSize={10} />
              <YAxis dataKey="label" type="category" fontSize={10} width={80} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-surface-1 border border-border-subtle p-4 rounded-xl h-64">
          <h3 className="text-sm font-bold mb-4">Potensi Wilayah</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={potensi} layout="vertical">
              <XAxis type="number" fontSize={10} />
              <YAxis dataKey="label" type="category" fontSize={10} width={80} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Scrollable Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar border-b border-border-subtle mb-6 sticky top-0 bg-bg-base z-10">
        <div className="flex w-max min-w-full px-1">
          {[
            { id: 'pastoral', icon: HandHeart, label: 'Pastoral' },
            { id: 'aset', icon: Building, label: 'Aset' },
            { id: 'demografi', icon: Users, label: 'Demografi' },
            { id: 'bantuan', icon: FileText, label: 'Bantuan' },
            { id: 'wilayah', icon: ShieldAlert, label: 'Wilayah' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[100px] flex flex-col items-center justify-center gap-1.5 p-3 border-b-2 transition-all ${
                  isActive 
                    ? 'border-brand-primary text-brand-primary font-bold' 
                    : 'border-transparent text-text-muted hover:text-text-subtle font-medium'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'pastoral' && renderPastoral()}
        {activeTab === 'aset' && renderAset()}
        {activeTab === 'demografi' && renderDemografi()}
        {activeTab === 'bantuan' && renderBantuan()}
        {activeTab === 'wilayah' && renderWilayah()}
      </div>
    </div>
  );
}
