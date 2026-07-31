'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Activity, Users, Database, Calendar, Info, TrendingUp, Clock, Edit3, Trash2, Loader2, X, ExternalLink } from 'lucide-react';
import { useHistoriStatus, useUpdateHistoriStatus, useDeleteHistoriStatus } from '@/hooks/use-hierarki';

import { useRouter } from 'next/navigation';

export function PosPelkesDetailTabs({ data }: { data: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profil');
  const [editingHistori, setEditingHistori] = useState<any | null>(null);
  const { data: historiList, refetch } = useHistoriStatus(data.posPelkes.id_pos);
  const updateHistoriMutation = useUpdateHistoriStatus();
  const deleteHistoriMutation = useDeleteHistoriStatus();

  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pos-pelkes-images/`;

  const tabs = [
    { id: 'profil', label: 'Profil', icon: Info },
    { id: 'pendeta', label: 'Pendeta & Pelayan', icon: User },
    { id: 'demografi', label: 'Demografi', icon: Users },
    { id: 'aset', label: 'Aset', icon: Database },
    { id: 'log', label: 'Log Pastoral', icon: Activity },
    { id: 'histori', label: 'Histori Status', icon: TrendingUp },
  ];

  const handleSaveEditHistori = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHistori) return;
    try {
      await updateHistoriMutation.mutateAsync({
        id_histori: editingHistori.id_histori,
        tanggal_perubahan: editingHistori.tanggal_perubahan,
        keterangan_perubahan: editingHistori.keterangan_perubahan,
        jemaat_ke: editingHistori.jemaat_ke ? Number(editingHistori.jemaat_ke) : null,
        catatan: editingHistori.catatan || null,
      });
      setEditingHistori(null);
      await refetch();
      router.refresh();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui catatan histori.');
    }
  };

  const handleDeleteHistori = async (id_histori: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan histori perubahan status ini?')) {
      try {
        await deleteHistoriMutation.mutateAsync(id_histori);
        await refetch();
        router.refresh();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus catatan histori.');
      }
    }
  };

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
            
            {/* Foto Utama Gedung / Lokasi Pos Pelkes */}
            {(data.posPelkes.foto_url || (data.asetTanah && data.asetTanah.length > 0 && data.asetTanah[0].t_lampiran_aset && data.asetTanah[0].t_lampiran_aset.length > 0)) && (
              <div className="bg-surface-elevated p-6 rounded-xl border border-border-subtle shadow-soft space-y-3">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <h3 className="text-base font-bold text-brand-primary">Foto Tampak Depan Gedung / Lokasi</h3>
                  <span className="text-[10px] font-bold text-text-muted bg-surface-sunken px-2.5 py-1 rounded-md border border-border-subtle">
                    Tampak Depan
                  </span>
                </div>
                <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden border border-border-subtle bg-surface-sunken">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={
                      data.posPelkes.foto_url 
                        ? data.posPelkes.foto_url
                        : `${storageUrl}${data.asetTanah[0].t_lampiran_aset[0].file_path}`
                    } 
                    alt={`Foto ${data.posPelkes.nama_pos}`} 
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

      case 'histori':
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2 flex items-center gap-2">
              <TrendingUp size={20} className="text-amber-600" />
              <span>Histori Peningkatan Status Pelayanan</span>
            </h3>

            {historiList && historiList.length > 0 ? (
              <div className="relative border-l-2 border-amber-400 ml-3 space-y-6 mt-4">
                {historiList.map((h: any) => (
                  <div key={h.id_histori} className="relative pl-6">
                    <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white"></span>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{h.status_lama || 'Pos Pelkes'}</span>
                        <span className="text-xs font-bold text-amber-600">➔</span>
                        <span className="font-extrabold text-sm text-brand-primary">{h.status_baru}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <time className="text-xs text-gray-500 font-mono flex items-center gap-1">
                          <Clock size={12} />
                          {h.tanggal_perubahan}
                        </time>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingHistori(h);
                            }}
                            className="min-h-[32px] px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer z-10 shadow-xs"
                            title="Edit Catatan Histori Ini"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteHistori(h.id_histori);
                            }}
                            className="min-h-[32px] px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer z-10 shadow-xs"
                            title="Hapus Catatan Histori Ini"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-sunken p-3.5 rounded-xl border border-border-subtle mt-2 space-y-2">
                      {h.jemaat_ke && (
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200">
                          Jemaat GPIB Ke-{h.jemaat_ke}
                        </div>
                      )}
                      <p className="text-xs text-text-high font-semibold leading-relaxed">
                        SK/Dasar: {h.keterangan_perubahan || 'Tidak ada catatan SK'}
                      </p>
                      {h.catatan && (
                        <p className="text-xs text-text-muted italic bg-white/60 p-2.5 rounded-lg border border-border-subtle/40">
                          &quot;{h.catatan}&quot;
                        </p>
                      )}
                      {h.id_induk_baru && (
                        <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[11px] font-mono text-purple-600 font-extrabold">
                            ID Jemaat Induk Mandiri: {h.id_induk_baru}
                          </span>
                          <Link
                            href={`/hierarki/${encodeURIComponent(data.posPelkes?.jemaat_induk?.id_mupel || 'all')}/${encodeURIComponent(h.id_induk_baru)}`}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                          >
                            <span>Detail Jemaat Induk</span>
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Clock size={32} className="mx-auto text-gray-300" />
                <p className="text-sm text-gray-500 italic">Belum ada riwayat peningkatan status yang tercatat.</p>
                <p className="text-xs text-gray-400">Tekan tombol &quot;Tingkatkan Status&quot; di header untuk mengubah status Pos Pelkes menjadi Bajem atau Jemaat Induk Mandiri.</p>
              </div>
            )}

            {/* Modal Edit Histori Status */}
            {editingHistori && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-sunken">
                    <h3 className="font-bold text-sm text-text-high flex items-center gap-2">
                      <Edit3 size={16} className="text-amber-600" />
                      <span>Edit Catatan Histori Status</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingHistori(null)}
                      className="p-1.5 rounded-lg text-text-muted hover:bg-surface-elevated transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditHistori} className="p-4 space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-high">Tanggal Perubahan Status *</label>
                      <input
                        type="date"
                        required
                        value={editingHistori.tanggal_perubahan || ''}
                        onChange={(e) => setEditingHistori({ ...editingHistori, tanggal_perubahan: e.target.value })}
                        className="w-full min-h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-high">Nomor SK / Dasar Keputusan *</label>
                      <textarea
                        rows={2}
                        required
                        value={editingHistori.keterangan_perubahan || ''}
                        onChange={(e) => setEditingHistori({ ...editingHistori, keterangan_perubahan: e.target.value })}
                        className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-high">Jemaat Ke- (Nomor Urut Sinode)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Contoh: 354"
                        value={editingHistori.jemaat_ke || ''}
                        onChange={(e) => setEditingHistori({ ...editingHistori, jemaat_ke: e.target.value ? Number(e.target.value) : null })}
                        className="w-full min-h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-base text-xs font-semibold text-text-high focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-high">Catatan Peningkatan Status</label>
                      <textarea
                        rows={2}
                        placeholder="Catatan latar belakang, sejarah, atau proses..."
                        value={editingHistori.catatan || ''}
                        onChange={(e) => setEditingHistori({ ...editingHistori, catatan: e.target.value })}
                        className="w-full p-3 rounded-xl border border-border-subtle bg-surface-base text-xs text-text-high focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>

                    <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingHistori(null)}
                        className="min-h-[40px] px-4 rounded-xl border border-border-subtle bg-surface-sunken hover:bg-surface-elevated text-xs font-bold text-text-high transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={updateHistoriMutation.isPending}
                        className="min-h-[40px] px-5 rounded-xl bg-amber-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-amber-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                      >
                        {updateHistoriMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                        <span>Simpan Perubahan</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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
