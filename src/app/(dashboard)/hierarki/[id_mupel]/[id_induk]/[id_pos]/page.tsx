import { Suspense } from 'react';
import { PosDetailClient } from './pos-detail-client';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id_mupel: string; id_induk: string; id_pos: string }>;
}

async function PosDetailWrapper({ params }: { params: PageProps['params'] }) {
  const resolvedParams = await params;
  const id_mupel = decodeURIComponent(resolvedParams.id_mupel);
  const id_induk = decodeURIComponent(resolvedParams.id_induk);
  const id_pos = decodeURIComponent(resolvedParams.id_pos);
  return <PosDetailClient id_mupel={id_mupel} id_induk={id_induk} id_pos={id_pos} />;
}

export default function PosPelkesHierarkiDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PosSkeleton />}>
      <PosDetailWrapper params={params} />
    </Suspense>
  );
}

function PosSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <Skeleton className="h-10 w-72 rounded-xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    </div>
  );
}
