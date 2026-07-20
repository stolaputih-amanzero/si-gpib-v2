'use client';

import { useState } from 'react';
import { User, Activity, Users, Database, Calendar, Info } from 'lucide-react';


export function PosPelkesDetailTabs({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('profil');

  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/`;

  const tabs = [
    { id: 'profil', label: 'Profil', icon: Info },
    { id: 'pendeta', label: 'Pendeta & Pelayan', icon: User },
    { id: 'demografi', label: 'Demografi', icon: Users },
    { id: 'aset', label: 'Aset', icon: Database },
    { id: 'log', label: 'Log Pastoral', icon: Activity },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Informasi Detail</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">ID Pos Pelkes</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{data.posPelkes.id_pos}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tanggal Berdiri</dt>
                  <dd className="mt-1 text-sm text-gray-900">{data.posPelkes.tgl_berdiri || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Koordinat GPS</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    {data.posPelkes.latitude && data.posPelkes.longitude ? (
                      <>
                        {data.posPelkes.latitude}, {data.posPelkes.longitude}
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${data.posPelkes.latitude},${data.posPelkes.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-brand-primary hover:underline text-xs bg-blue-50 px-2 py-0.5 rounded"
                        >
                          Buka di Map
                        </a>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Belum disetel</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Keterangan Tambahan</dt>
                  <dd className="mt-1 text-sm text-gray-900">{data.posPelkes.keterangan || '-'}</dd>
                </div>
              </dl>
            </div>
            
            {data.asetTanah && data.asetTanah.length > 0 && data.asetTanah[0].t_lampiran_aset && data.asetTanah[0].t_lampiran_aset.length > 0 && (
               <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Foto Utama</h3>
                <div className="relative h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`${storageUrl}${data.asetTanah[0].t_lampiran_aset[0].file_path}`} 
                    alt="Foto Pos Pelkes" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      
      case 'pendeta':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Pendeta yang Ditugaskan</h3>
              {data.penugasanPendeta.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {data.penugasanPendeta.map((p: any) => (
                    <li key={p.id_penugasan} className="py-4 flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="text-brand-primary" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{p.m_pendeta?.nama_pendeta || 'Pendeta Tidak Diketahui'}</p>
                        <p className="text-sm text-gray-500">No SK: {p.no_sk || '-'} | Mulai: {p.tgl_mulai || '-'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-6">Tidak ada pendeta yang ditugaskan saat ini.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Daftar Pelayan / Relawan</h3>
              {data.pelayan.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {data.pelayan.map((p: any) => (
                    <li key={p.id_pelayan} className="py-4 flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User className="text-brand-secondary" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{p.nama_pelayan}</p>
                        <p className="text-sm text-gray-500">Jabatan: {p.jabatan || '-'} | Kontak: {p.no_telepon || '-'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-6">Tidak ada data pelayan yang terdaftar.</p>
              )}
            </div>
          </div>
        );
        
      case 'demografi':
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center py-12 animate-in fade-in duration-300">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Modul Demografi</h3>
            <p className="text-gray-500 text-sm mt-1">Data demografi, statistik pelkat, dan kerawanan sosial akan ditampilkan di sini (Tahap Pengembangan Selanjutnya).</p>
          </div>
        );
        
      case 'aset':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Aset Tanah & Properti</h3>
              {data.asetTanah.length > 0 ? (
                <div className="space-y-4">
                  {data.asetTanah.map((aset: any) => (
                    <div key={aset.id_tanah} className="border border-gray-100 rounded-lg p-4 hover:border-brand-primary/30 transition-colors bg-gray-50/50">
                      <div className="flex justify-between">
                        <h4 className="font-semibold text-gray-900">ID: {aset.id_tanah}</h4>
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {aset.status_hukum || 'Status Tidak Jelas'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{aset.keterangan || '-'}</p>
                      <div className="mt-3 flex gap-4 text-xs text-gray-500">
                        <span>Luas: {aset.luas_m2 ? `${aset.luas_m2} m²` : '-'}</span>
                        <span>Tahun Perolehan: {aset.thn_perolehan || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-6">Belum ada data aset tanah yang terdaftar.</p>
              )}
            </div>
          </div>
        );

      case 'log':
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Log Kegiatan Pastoral</h3>
            
            {data.logPastoral.length > 0 ? (
              <div className="relative border-l border-gray-200 ml-3 space-y-8 mt-6">
                {data.logPastoral.map((log: any) => (
                  <div key={log.id_log} className="relative pl-6">
                    <span className="absolute -left-[5px] top-1 h-[10px] w-[10px] rounded-full bg-brand-primary ring-4 ring-white"></span>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">{log.jenis_kegiatan}</h4>
                      <time className="text-xs text-gray-500 mt-1 sm:mt-0 flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {log.tanggal}
                      </time>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 mt-2">
                      {log.keterangan || '-'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-6">Belum ada catatan log pastoral.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Mobile Tab Selector (Dropdown-like styling for small screens could be added here, but scrolling tabs is standard) */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 sm:rounded-t-xl sm:border sm:border-b-0 shadow-sm">
        <nav className="flex overflow-x-auto hide-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-brand-primary text-brand-primary bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} className={`mr-2 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="pt-6 sm:bg-transparent">
        {renderContent()}
      </div>
    </div>
  );
}
