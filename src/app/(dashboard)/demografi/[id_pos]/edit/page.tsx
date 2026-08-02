import { use, Suspense } from 'react';
import { DemografiEditFormClient } from '@/components/demografi/DemografiEditFormClient';

export default function DemografiEditPage({ params }: { params: Promise<{ id_pos: string }> }) {
  const resolvedParams = use(params);
  const id_pos = resolvedParams.id_pos;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse font-medium">
          Memuat form edit demografi...
        </div>
      }
    >
      <DemografiEditFormClient id_pos={id_pos} />
    </Suspense>
  );
}
