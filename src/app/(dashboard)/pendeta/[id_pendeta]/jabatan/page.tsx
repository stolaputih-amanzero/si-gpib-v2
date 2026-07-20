'use client';

import { use, useState } from 'react';
import { usePendetaDetail } from '@/hooks/use-pendeta';
import { useJabatanByPendeta, useDeleteJabatan, JabatanStrukturalItem } from '@/hooks/use-jabatan-struktural';
import { JabatanStrukturalForm } from '@/components/pendeta/JabatanStrukturalForm';
import { JabatanStrukturalCard } from '@/components/pendeta/JabatanStrukturalCard';
import { ArrowLeft, Plus, Building2, Loader2, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function KelolaJabatanPage({ params }: { params: Promise<{ id_pendeta: string }> }) {
  const resolvedParams = use(params);
  const id_pendeta = resolvedParams.id_pendeta;

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<JabatanStrukturalItem | null>(null);

  const { data: pendeta, isLoading: pendetaLoading } = usePendetaDetail(id_pendeta);
  const { data: jabatans, isLoading: jabatanLoading } = useJabatanByPendeta(id_pendeta);
  const deleteMutation = useDeleteJabatan();

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: JabatanStrukturalItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id_jabatan: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus riwayat jabatan ini?')) {
      try {
        await deleteMutation.mutateAsync({ id_jabatan, id_pendeta });
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus jabatan.');
      }
    }
  };

  if (pendetaLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-sm text-text-muted">Memuat data pendeta...</p>
      </div>
    );
  }

  if (!pendeta) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="font-semibold text-text-high">Data Pendeta tidak ditemukan.</p>
        <Link href="/pendeta" className="text-brand-primary hover:underline font-medium text-sm">
          Kembali ke Daftar Pendeta
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-surface-base pb-32 md:pb-12">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/85 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href={`/pendeta/${id_pendeta}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-primary min-h-[44px]"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Kembali ke Profil</span>
            <span className="sm:hidden">Kembali</span>
          </Link>

          <button
            type="button"
            onClick={handleAddNew}
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-blue-800 transition-all flex items-center gap-1.5 shadow-sm min-h-[44px]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Jabatan</span>
            <span className="sm:hidden">+ Jabatan</span>
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header Info */}
        <div>
          <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-text-muted">
            <Building2 size={16} />
            <span>Kelola Jabatan Struktural</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-text-high">
            {pendeta.nama_lengkap}
          </h1>
          <p className="text-sm text-brand-primary font-medium mt-1">
            {pendeta.id_pendeta}
          </p>
        </div>

        {/* List Jabatan */}
        <div className="space-y-4">
          {jabatanLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface-elevated p-4 rounded-xl border border-border-subtle animate-pulse h-[100px]"></div>
              ))}
            </div>
          ) : jabatans && jabatans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jabatans.map((jabatan) => (
                <JabatanStrukturalCard
                  key={jabatan.id_jabatan}
                  item={jabatan}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-elevated rounded-xl p-8 text-center border border-border-subtle space-y-3">
              <UserCheck size={40} className="mx-auto text-text-muted opacity-50" />
              <div>
                <p className="font-semibold text-text-high text-sm">Belum Ada Jabatan Struktural</p>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                  Gunakan tombol "+ Tambah Jabatan" di kanan atas untuk mendaftarkan jabatan struktural seperti BP Mupel, Panitia, dll.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-surface-elevated w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-5 border border-border-subtle shadow-float max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h2 className="text-base font-bold text-brand-primary flex items-center gap-2">
                <Building2 size={18} />
                <span>{editingItem ? 'Edit Jabatan Struktural' : 'Tambah Jabatan Struktural'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-high transition-colors"
              >
                ✕
              </button>
            </div>

            <JabatanStrukturalForm
              id_pendeta={id_pendeta}
              initialData={editingItem}
              onSuccess={() => setShowModal(false)}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
