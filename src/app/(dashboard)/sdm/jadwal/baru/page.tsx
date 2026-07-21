'use client';

import { useRouter } from 'next/navigation';
import { JadwalForm } from '@/components/jadwal/JadwalForm';
import { useToast } from '@/components/ui/toast';
import { Calendar, ChevronLeft } from 'lucide-react';

export default function JadwalBaruPage() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface-elevated/90 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 rounded-xl text-text-high hover:bg-surface-sunken transition-all border border-border-subtle/50"
              aria-label="Kembali"
            >
              <ChevronLeft size={20} className="text-brand-primary" />
            </button>
            <div>
              <h1 className="text-lg font-serif font-bold text-text-high leading-tight">
                Tambah Jadwal Ibadah
              </h1>
              <p className="text-xs text-text-muted">
                Penjadwalan Ibadah Rutin, Pelkat & Sektor Pos Pelkes
              </p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft">
          <JadwalForm
            onSuccess={() => {
              toast.success('Berhasil Disimpan', 'Jadwal ibadah telah berhasil ditambahkan.');
              router.push('/sdm/jadwal');
            }}
          />
        </div>
      </div>
    </div>
  );
}
