import { Suspense } from 'react';
import { PastoralFormClient } from '@/components/pastoral/PastoralFormClient';

export default function PastoralNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-text-muted animate-pulse font-medium">Memuat form pastoral...</div>}>
      <PastoralFormClient />
    </Suspense>
  );
}
