import { createClient } from '@/lib/supabase/server';
import { LogForm } from './log-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
export const metadata = {
  title: 'Input Log Pastoral | SI GPIB',
};

export default async function TambahLogPage() {
  const supabase = await createClient();

  // Ambil daftar pos pelkes
  const { data: posList } = await supabase
    .from('m_pos_pelkes')
    .select('id_pos, nama_pos')
    .order('nama_pos');

  // Ambil daftar pendeta
  const { data: pendetaList } = await supabase
    .from('m_pendeta')
    .select('id_pendeta, nama_lengkap')
    .order('nama_lengkap');

  return (
    <div className="min-h-screen bg-surface-base pb-safe">
      <div className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-subtle pt-safe">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link 
            href="/dashboard/pastoral" 
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "min-h-[44px] min-w-[44px]")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-text-high">Input Log Pastoral</h1>
            <p className="text-sm text-text-muted">Laporkan aktivitas pelayanan</p>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <LogForm posList={posList || []} pendetaList={pendetaList || []} />
      </main>
    </div>
  );
}
