'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDemografiByPos, useDeleteDemografi } from '@/hooks/use-demografi';
import { DemografiForm } from '@/components/demografi/DemografiForm';
import { DemografiChart } from '@/components/demografi/DemografiChart';
import { KATEGORI_PELKAT } from '@/lib/constants/pelkat';
import { ArrowLeft, Plus, Edit2, Trash2, Check } from 'lucide-react';
import Link from 'next/link';

function DemografiPosContent({ id_pos }: { id_pos: string }) {
  const router = useRouter();
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const { data: demografiData, isLoading } = useDemografiByPos(id_pos);
  const deleteMutation = useDeleteDemografi();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleAddNew = (kode?: string) => {
    setEditingItem(kode ? { id_pos, kategori_pelkat: kode } : { id_pos });
    setShowFormModal(true);
  };

  const handleDelete = async (kategori_pelkat: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data demografi ${kategori_pelkat}?`)) {
      await deleteMutation.mutateAsync({ id_pos, kategori_pelkat });
    }
  };

  useEffect(() => {
    if (action === 'new') {
      const timer = setTimeout(() => {
        handleAddNew();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [action]);

  // Aggregate stats
  let totalJiwa = 0;
  let totalKk = 0;
  let totalLaki = 0;
  let totalPerempuan = 0;

  const chartData = KATEGORI_PELKAT.map((k) => {
    const found = demografiData?.find((d: any) => d.kategori_pelkat === k.kode);
    const laki = found ? found.laki || 0 : 0;
    const perempuan = found ? found.perempuan || 0 : 0;
    const sum = laki + perempuan;

    totalJiwa += sum;
    totalKk += found ? found.jml_kk || 0 : 0;
    totalLaki += laki;
    totalPerempuan += perempuan;

    return {
      kategori_pelkat: k.kode,
      laki,
      perempuan,
    };
  });

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/pos-pelkes/${id_pos}`}
              className="w-10 h-10 rounded-xl bg-surface-sunken flex items-center justify-center text-text-high hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-brand-primary truncate max-w-[200px] sm:max-w-xs">
                Demografi Pos Pelkes
              </h1>
              <p className="text-xs text-text-muted">ID: {id_pos}</p>
            </div>
          </div>

          {demografiData && demografiData.length > 0 ? (
            <button
              onClick={() => handleAddNew()}
              className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
            >
              <Edit2 size={16} />
              <span>Edit Demografi</span>
            </button>
          ) : (
            <button
              onClick={() => handleAddNew()}
              className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
            >
              <Plus size={16} />
              <span>Tambah Data</span>
            </button>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-text-muted">Total Jiwa</p>
            <p className="text-2xl font-bold text-brand-primary tabular-nums mt-0.5">{totalJiwa}</p>
          </div>
          <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-text-muted">Total KK</p>
            <p className="text-2xl font-bold text-text-high tabular-nums mt-0.5">{totalKk}</p>
          </div>
          <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-blue-600 dark:text-blue-400">Laki-Laki</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">{totalLaki}</p>
          </div>
          <div className="bg-surface-elevated p-3.5 rounded-xl border border-border-subtle shadow-soft">
            <p className="text-xs text-pink-600 dark:text-pink-400">Perempuan</p>
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 tabular-nums mt-0.5">{totalPerempuan}</p>
          </div>
        </div>

        {/* Demografi Chart */}
        <div className="bg-surface-elevated p-4 md:p-6 rounded-xl border border-border-subtle shadow-soft space-y-3">
          <h2 className="text-base font-semibold text-text-high">Grafik Demografi Pos Pelkes</h2>
          <DemografiChart data={chartData} />
        </div>

        {/* 6 Pelkat Category Grid Status & Record List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-high">Status 6 Pelkat Standar GPIB</h2>
            <span className="text-xs text-text-muted">
              {isLoading ? 'Memuat...' : demografiData ? `${demografiData.length} / 6 Terisi` : '0 / 6'}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface-elevated p-4 rounded-xl border border-border-subtle animate-pulse space-y-3">
                  <div className="h-4 bg-surface-sunken rounded w-1/2"></div>
                  <div className="h-10 bg-surface-sunken rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {KATEGORI_PELKAT.map((pelkat) => {
              const record = demografiData?.find((d: any) => d.kategori_pelkat === pelkat.kode);
              const total = record ? (record.laki || 0) + (record.perempuan || 0) : 0;

              return (
                <div 
                  key={pelkat.kode}
                  className={`bg-surface-elevated p-4 rounded-xl border transition-all ${
                    record ? 'border-border-subtle shadow-soft' : 'border-dashed border-gray-300 dark:border-gray-700 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{pelkat.icon}</span>
                      <div>
                        <h3 className="font-semibold text-text-high text-sm">{pelkat.nama}</h3>
                        <p className="text-[11px] text-text-muted">{pelkat.kode} • {pelkat.deskripsi}</p>
                      </div>
                    </div>

                    {record ? (
                      <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                        <Check size={14} />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddNew(pelkat.kode)}
                        className="text-xs text-brand-primary font-semibold hover:underline"
                      >
                        + Isi Data
                      </button>
                    )}
                  </div>

                  {record ? (
                    <div className="mt-3 pt-3 border-t border-border-subtle space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-surface-sunken p-1.5 rounded-lg">
                          <span className="text-text-muted block text-[10px]">KK</span>
                          <span className="font-bold tabular-nums">{record.jml_kk || 0}</span>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                          <span className="block text-[10px]">Laki</span>
                          <span className="font-bold tabular-nums">{record.laki || 0}</span>
                        </div>
                        <div className="bg-pink-50 dark:bg-pink-950/40 p-1.5 rounded-lg text-pink-600 dark:text-pink-400">
                          <span className="block text-[10px]">Pr</span>
                          <span className="font-bold tabular-nums">{record.perempuan || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-semibold text-brand-primary">Total: {total} Jiwa</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-brand-primary hover:bg-surface-sunken transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.kategori_pelkat)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            title="Hapus Data"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 text-center">
                      <p className="text-xs text-text-muted italic">Belum ada data tercatat</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      </main>

      {/* Form Modal / Drawer */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 border border-border-subtle shadow-float max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-bold text-brand-primary">
                {editingItem?.kategori_pelkat || (demografiData && demografiData.length > 0)
                  ? 'Edit Demografi Pelkat'
                  : 'Input Demografi Pelkat Baru'}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high"
              >
                ✕
              </button>
            </div>

            <DemografiForm 
              id_pos={id_pos} 
              initialData={editingItem} 
              onSuccess={() => {
                setShowFormModal(false);
                router.push(`/demografi/${id_pos}`);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemografiPosPage({ params }: { params: Promise<{ id_pos: string }> }) {
  const resolvedParams = use(params);
  const id_pos = resolvedParams.id_pos;

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted animate-pulse">Memuat demografi...</div>}>
      <DemografiPosContent id_pos={id_pos} />
    </Suspense>
  );
}
