'use client';

import { useRouter } from 'next/navigation';
import { PendetaForm } from '@/components/pendeta/PendetaForm';
import { useToast } from '@/components/ui/toast';
import { UserPlus, ChevronLeft } from 'lucide-react';

export default function PendetaBaruPage() {
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
                Tambah Pendeta GPIB
              </h1>
              <p className="text-xs text-text-muted">
                Pendataan Pendeta Organik / Non-Organik Jemaat & Pos
              </p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
            <UserPlus size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-surface-elevated p-5 rounded-2xl border border-border-subtle shadow-soft">
          <PendetaForm
            onSuccess={() => {
              toast.success('Berhasil Disimpan', 'Data pendeta baru telah berhasil ditambahkan.');
              router.push('/sdm/pendeta');
            }}
          />
        </div>
      </div>
    </div>
  );
}
