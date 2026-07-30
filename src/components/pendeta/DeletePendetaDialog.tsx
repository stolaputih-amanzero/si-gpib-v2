'use client';

import { useState } from 'react';
import { Trash2, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { useDeletePendeta } from '@/hooks/use-delete-pendeta';

interface Props {
  idPendeta: string;
  namaPendeta: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function DeletePendetaDialog({ idPendeta, namaPendeta, open, onOpenChange }: Props) {
  const [restrictMsg, setRestrictMsg] = useState<string | null>(null);
  const { mutateAsync, isPending } = useDeletePendeta();
  const { toast } = useToast();

  const handleDelete = async () => {
    setRestrictMsg(null);
    try {
      await mutateAsync(idPendeta);
      toast.success('Berhasil', `${namaPendeta} telah dihapus.`);
      onOpenChange(false);
    } catch (info) {
      // info sudah berupa DbErrorInfo (sudah diterjemahkan)
      const err = info as { title?: string; userMessage?: string; code?: string };
      if (err.code === '23503') {
        setRestrictMsg(err.userMessage ?? null); // tampilkan inline, jangan tutup dialog
      } else {
        toast.error(err.title ?? 'Gagal', err.userMessage || 'Gagal menghapus pendeta');
        onOpenChange(false);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">Hapus {namaPendeta}?</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Tindakan ini tidak dapat dibatalkan. Data pribadi pendeta akan dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {restrictMsg && (
          <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <ShieldAlert className="h-6 w-6 flex-shrink-0" aria-hidden />
            <p className="text-base leading-relaxed">{restrictMsg}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} className="h-12">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending || !!restrictMsg}
            className="h-12 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="mr-2 h-5 w-5" />
            {isPending ? 'Menghapus…' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
