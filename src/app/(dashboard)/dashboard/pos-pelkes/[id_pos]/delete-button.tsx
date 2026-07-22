'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deletePosPelkes } from '../baru/actions';
import { Trash2, Loader2 } from 'lucide-react';

export default function DeletePosButton({ id_pos, nama_pos }: { id_pos: string; nama_pos: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus data ${nama_pos}?`)) {
      setIsDeleting(true);
      const result = await deletePosPelkes(id_pos);
      if (result?.error) {
        alert(result.error);
        setIsDeleting(false);
      } else {
        router.push('/dashboard/pos-pelkes');
        router.refresh();
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="min-h-[40px] px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
    >
      {isDeleting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
      <span>Hapus</span>
    </button>
  );
}
