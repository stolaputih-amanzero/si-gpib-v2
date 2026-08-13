import type { ContextLevel } from './types/identity.types';
import type { PermissionId } from './types/contract.types';

export function getSectionCapabilities(contextLevel: ContextLevel, permissions: PermissionId[]) {
  return {
    // Selalu ada (T3: empty state jika data tidak ada)
    overview: true,
    identity: true,
    
    // T2: hide jika no permission
    sdm: permissions.includes('person.read'),
    demografi: permissions.includes('demography.read'),
    pastoral: permissions.includes('pastoral.read'),
    assets: permissions.includes('asset.read'),
    
    // T1: hide di Pos (ontologically irrelevant)
    territory: contextLevel !== 'POS' && permissions.includes('territory.update'),
    
    // T2: hide jika no permission
    aid: permissions.includes('aid.create') || permissions.includes('aid.approve.step_1'),
  };
}
