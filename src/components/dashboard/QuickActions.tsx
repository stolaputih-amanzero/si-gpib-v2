'use client';

import { Plus, PenTool } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <div className="fixed bottom-24 right-5 md:bottom-10 md:right-10 z-40 flex flex-col gap-3">
      <Link 
        href="/dashboard/pastoral/baru"
        className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 text-brand-primary shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-transform active:scale-95 border border-border-subtle"
        title="Input Log Pastoral"
      >
        <PenTool size={20} />
      </Link>
      <Link 
        href="/dashboard/pos-pelkes/baru"
        className="w-14 h-14 rounded-full bg-brand-primary text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-95"
        title="Tambah Pos Pelkes"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}
