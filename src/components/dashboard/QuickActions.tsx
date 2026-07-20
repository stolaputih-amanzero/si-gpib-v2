'use client';

import { Plus, PenTool } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex flex-col gap-3">
      <Link 
        href="/dashboard/pastoral/baru"
        className="w-12 h-12 rounded-full bg-white text-brand-primary shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] flex items-center justify-center hover:bg-gray-50 transition-transform hover:scale-105"
        title="Input Log Pastoral"
      >
        <PenTool size={20} />
      </Link>
      <Link 
        href="/dashboard/pos-pelkes/baru"
        className="w-14 h-14 rounded-full bg-brand-primary text-white shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] flex items-center justify-center hover:bg-blue-700 transition-transform hover:scale-105"
        title="Tambah Pos Pelkes"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}
