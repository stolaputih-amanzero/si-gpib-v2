'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { CreatePersonModal } from './CreatePersonModal';

interface CreatePersonButtonProps {
  defaultMupelId?: string | null;
  defaultIndukId?: string | null;
}

export function CreatePersonButton({ defaultMupelId, defaultIndukId }: CreatePersonButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 active:scale-95 transition-all cursor-pointer border border-amber-400/20 shrink-0"
        aria-label="Tambah SDM Baru"
      >
        <UserPlus className="size-4 shrink-0" />
        <span>Tambah SDM</span>
      </button>

      <CreatePersonModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultMupelId={defaultMupelId}
        defaultIndukId={defaultIndukId}
      />
    </>
  );
}
