'use client';

import { useRouter } from 'next/navigation';
import { RelawanForm } from '@/components/relawan/RelawanForm';
import { useToast } from '@/components/ui/toast';
import { HeartHandshake, ChevronLeft } from 'lucide-react';

export default function RelawanBaruPage() {
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
                Tambah Relawan Pos
              </h1>
              <p className="text-xs text-text-muted">
                Pendataan Relawan Pemuda, Medis & Kemasyarakatan
              </p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
            <HeartHandshake size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft">
          <RelawanForm
            onSuccess={() => {
              toast.success('Berhasil Disimpan', 'Data relawan telah berhasil ditambahkan.');
              router.push('/sdm/relawan');
            }}
          />
        </div>
      </div>
    </div>
  );
}
