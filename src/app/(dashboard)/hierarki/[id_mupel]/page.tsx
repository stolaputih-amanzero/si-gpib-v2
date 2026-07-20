import { Suspense } from 'react';
import { MupelDetailClient } from './mupel-detail-client';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id_mupel: string }>;
}

export default async function MupelDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id_mupel = decodeURIComponent(resolvedParams.id_mupel);

  return (
    <Suspense fallback={<MupelSkeleton />}>
      <MupelDetailClient id_mupel={id_mupel} />
    </Suspense>
  );
}

function MupelSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    </div>
  );
}
