'use client';

import React, { useMemo } from 'react';
import { UnifiedAssetData } from '@/types/asset.types';
import { adaptAssetToViewModel } from '@/adapters/assetViewModelAdapter';
import { AssetHeader } from './AssetHeader';
import { AssetNavigationAnchor } from './AssetNavigationAnchor';
import { AssetOverviewSection } from './sections/AssetOverviewSection';
import { AssetPhysicalSection } from './sections/AssetPhysicalSection';
import { AssetLocationSection } from './sections/AssetLocationSection';
import { AssetValuationSection } from './sections/AssetValuationSection';
import { AssetLegalSection } from './sections/AssetLegalSection';

interface AssetWorkspaceShellProps {
  asset: UnifiedAssetData;
}

export const AssetWorkspaceShell: React.FC<AssetWorkspaceShellProps> = ({ asset }) => {
  // Pass through UI Anti-Corruption Layer (Adapter)
  const vm = useMemo(() => adaptAssetToViewModel(asset), [asset]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16 space-y-6">
      {/* 1. Header (Identity-First Banner) */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <AssetHeader header={vm.header} />
      </div>

      {/* 2. Single Top Sticky Anchor Bar (Mobile-first PWA Nav) */}
      <div className="max-w-6xl mx-auto px-4">
        <AssetNavigationAnchor />
      </div>

      {/* 3. The 5 Progressive Workspace Sections */}
      <main className="max-w-6xl mx-auto px-4 space-y-10">
        <AssetOverviewSection overview={vm.overview} />
        <AssetPhysicalSection physical={vm.physical} />
        <AssetLocationSection location={vm.location} />
        <AssetValuationSection valuation={vm.valuation} />
        <AssetLegalSection legal={vm.legal} />
      </main>
    </div>
  );
};
