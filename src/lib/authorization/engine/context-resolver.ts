import type { ActiveContextObject, BaseIdentity } from '../types';

export interface ContextResolver {
  /**
   * Validates claimed context against Assignment model.
   * Returns null if validation fails (Context Resolution Failure).
   * If null: NO Authorization Decision, NO Frozen Error Code.
   */
  resolve(claimedContextId: string | null, identity: BaseIdentity): Promise<ActiveContextObject | null>;
}

export class MockContextResolver implements ContextResolver {
  async resolve(claimedContextId: string | null, _identity: BaseIdentity): Promise<ActiveContextObject | null> {
    // In Phase 5, this will query the database to validate 
    // that the claimed context exists and the user has an assignment to it.
    
    // For now, if claimedContextId is 'INVALID', return null (failure)
    if (claimedContextId === 'INVALID') return null;
    
    return {
      context_id: claimedContextId || '',
      context_level: 'POS', // Mocked
      parent_context_id: 'JEMAAT-001', // Mocked
      descendant_reachability: { type: 'derived' },
      resolution_source: 'SERVER_SIDE_VALIDATION'
    };
  }
}
