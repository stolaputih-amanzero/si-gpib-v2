'use client';

import { useRouter } from 'next/navigation';
import { PelayanForm } from '@/components/pelayan/PelayanForm';
import { useToast } from '@/components/ui/toast';
import { Users, ChevronLeft } from 'lucide-react';

export default function PelayanBaruPage() {
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
                Tambah Pelayan Pos
              </h1>
              <p className="text-xs text-text-muted">
                Pendataaan Pendeta, Penatua, atau Diaken Pos Pelkes
              </p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft">
          <PelayanForm
            onSuccess={() => {
              toast.success('Berhasil Disimpan', 'Data pelayan Pos Pelkes telah berhasil didaftarkan.');
              router.push('/sdm/pelayan');
            }}
          />
        </div>
      </div>
    </div>
  );
}
