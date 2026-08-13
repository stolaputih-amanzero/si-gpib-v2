import { Suspense } from 'react';
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { getServerContext } from '@/lib/utils/context';
import { WorkspaceShell } from '@/components/workspace/organization/WorkspaceShell';
import { SectionBoundary } from '@/components/workspace/organization/SectionBoundary';
import { 
  OverviewSection, 
  IdentitySection 
} from '@/components/workspace/organization/CoreSections';
import { SdmSection } from '@/components/workspace/organization/SdmSection';
import { DemografiSection } from '@/components/workspace/organization/DemografiSection';
import { PastoralSection } from '@/components/workspace/organization/PastoralSection';
import { AssetsSection } from '@/components/workspace/organization/AssetsSection';
import { TerritorySection } from '@/components/workspace/organization/TerritorySection';
import { AidRequestsSection } from '@/components/workspace/organization/AidRequestsSection';
import { 
  OverviewSkeleton, 
  IdentitySkeleton,
  SectionSkeleton
} from '@/components/workspace/organization/skeletons';

export default async function OrganisasiPage() {
  const context = await getServerContext();
  
  if (context.status !== 'VALID' || !context.context_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
        <p className="text-muted-foreground">Silakan pilih lokasi tugas (Konteks Kerja) yang valid di header atas.</p>
      </div>
    );
  }

  cacheTag(`org-workspace-${context.context_id}`);

  // T1: Ontologically Irrelevant for POS
  const isPos = context.context_id.startsWith('POS-');
  // Hacky derivation of contextLevel from id, should ideally come from backend
  const contextLevel = context.context_id.startsWith('POS-') ? 'POS' : 
                       context.context_id.startsWith('ORG-') ? 'JEMAAT' : 'MUPEL';

  return (
    <WorkspaceShell contextLevel={contextLevel} contextId={context.context_id}>
      <SectionBoundary>
        <Suspense fallback={<OverviewSkeleton />}>
          <OverviewSection contextId={context.context_id} />
        </Suspense>
      </SectionBoundary>

      <SectionBoundary>
        <Suspense fallback={<IdentitySkeleton />}>
          <IdentitySection contextId={context.context_id} />
        </Suspense>
      </SectionBoundary>

      <SectionBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <SdmSection contextId={context.context_id} />
        </Suspense>
      </SectionBoundary>

      <SectionBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <DemografiSection contextId={context.context_id} />
        </Suspense>
      </SectionBoundary>

      <SectionBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <PastoralSection contextId={context.context_id} />
        </Suspense>
      </SectionBoundary>

      <SectionBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <AssetsSection contextId={context.context_id} />
        </Suspense>
      </SectionBoundary>

      {!isPos && (
        <SectionBoundary>
          <Suspense fallback={<SectionSkeleton />}>
            <TerritorySection contextId={context.context_id} />
          </Suspense>
        </SectionBoundary>
      )}

      <SectionBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <AidRequestsSection contextId={context.context_id} />
        </Suspense>
      </SectionBoundary>
    </WorkspaceShell>
  );
}
