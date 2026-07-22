'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PJSelector } from '@/components/hierarki/PJSelector';
import { HeartHandshake } from 'lucide-react';

interface AssignPjButtonProps {
  id_induk: string;
  nama_induk: string;
}

export default function AssignPjButton({ id_induk, nama_induk }: AssignPjButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="min-h-[36px] px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
      >
        <HeartHandshake size={14} />
        <span>Kelola Penugasan Pendeta Jemaat</span>
      </button>

      {isOpen && (
        <PJSelector
          id_induk={id_induk}
          nama_induk={nama_induk}
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
