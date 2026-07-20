import { Suspense } from 'react';
import { JemaatDetailClient } from './jemaat-detail-client';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id_mupel: string; id_induk: string }>;
}

export default async function JemaatDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id_mupel = decodeURIComponent(resolvedParams.id_mupel);
  const id_induk = decodeURIComponent(resolvedParams.id_induk);

  return (
    <Suspense fallback={<JemaatSkeleton />}>
      <JemaatDetailClient id_mupel={id_mupel} id_induk={id_induk} />
    </Suspense>
  );
}

function JemaatSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}
