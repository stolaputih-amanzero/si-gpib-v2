'use client';

import { AsetForm } from '@/components/aset/AsetForm';

interface AssetFormTabsProps {
  idPos: string;
}

export function AssetFormTabs({ idPos }: AssetFormTabsProps) {
  return <AsetForm id_pos={idPos} showHierarchySelector={false} />;
}

