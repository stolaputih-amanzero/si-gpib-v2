import type { BaseIdentity, IdentityObject, ActiveContextObject } from '../types';

export interface IdentityResolver {
  resolveBase(session: any): Promise<BaseIdentity>;
  resolveFull(base: BaseIdentity, activeContext: ActiveContextObject): Promise<IdentityObject>;
}

export class MockIdentityResolver implements IdentityResolver {
  async resolveBase(session: any): Promise<BaseIdentity> {
    return {
      user_account_id: session.user_id,
      session_valid: true,
      person_linkage: {
        person_id: session.person_id,
        person_type: 'Pendeta', // Mocked
        homebase_context_id: 'JEMAAT-001' // Mocked
      }
    };
  }

  async resolveFull(base: BaseIdentity, activeContext: ActiveContextObject): Promise<IdentityObject> {
    // In Phase 5, this is where Role Binding happens:
    // Query t_penugasan_pendeta, t_pj_jemaat, etc. to determine 
    // the effective_system_role based on the active context.
    
    return {
      system_identity: {
        user_account_id: base.user_account_id,
        session_valid: base.session_valid
      },
      person_linkage: base.person_linkage,
      role_bindings: {
        // Mocked: In reality, derived from assignments + active context
        effective_system_role: 'pj', 
        organizational_roles: [
          { role: 'PJ Pos', context_id: activeContext.context_id }
        ]
      }
    };
  }
}
