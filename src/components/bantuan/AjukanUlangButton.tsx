'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { haptic } from '@/lib/haptic/vibrate';

interface AjukanUlangButtonProps {
  idAjuanLama: string;
  /** ID user yang login saat ini */
  currentUserId: string;
  /** ID pemohon asli (dari field diajukan_oleh) */
  diajukanOleh: string;
  status: string;
  className?: string;
}

export function AjukanUlangButton({
  idAjuanLama,
  currentUserId,
  diajukanOleh,
  status,
  className,
}: AjukanUlangButtonProps) {
  const router = useRouter();

  // Guard: hanya tampilkan jika Rejected + user adalah pemohon
  if (status !== 'Rejected') return null;
  if (currentUserId !== diajukanOleh) return null;

  const handleClick = () => {
    haptic('light');
    router.push(`/bantuan/ajukan-ulang/${idAjuanLama}`);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={`w-full min-h-[48px] border-blue-300 text-blue-700 hover:bg-blue-50 ${className ?? ''}`}
      onClick={handleClick}
      aria-label="Ajukan ulang bantuan yang ditolak"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Ajukan Ulang
    </Button>
  );
}
