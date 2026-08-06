'use client';

import { AsetTabs } from '@/components/aset/AsetTabs';

export interface AsetTabProps {
  id_pos: string;
  canWrite?: boolean;
}

export function AsetTab({ id_pos }: AsetTabProps) {
  return (
    <div className="animate-tab-fade">
      <AsetTabs idPos={id_pos} />
    </div>
  );
}

export default AsetTab;
