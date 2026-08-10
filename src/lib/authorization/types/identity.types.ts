export type PersonType = 'Pendeta' | 'Pelayan' | 'Relawan';

export type SystemRole =
  | 'super_user'
  | 'admin_mupel'
  | 'kmj'
  | 'pj'
  | 'pendeta'
  | 'pelayan'
  | 'relawan'
  | 'read_only';

export type ContextLevel = 'POS' | 'JEMAAT' | 'MUPEL' | 'GLOBAL';

export interface BaseIdentity {
  user_account_id: string;
  session_valid: boolean;
  person_linkage: {
    person_id: string | null;
    person_type: PersonType | null;
    homebase_context_id: string | null;
  };
}

export interface IdentityObject {
  system_identity: {
    user_account_id: string;
    session_valid: boolean;
  };
  person_linkage: {
    person_id: string | null;
    person_type: PersonType | null;
    homebase_context_id: string | null;
  };
  role_bindings: {
    effective_system_role: SystemRole;
    organizational_roles: any[];
  };
}

export interface ActiveContextObject {
  context_id: string;
  context_level: ContextLevel;
  parent_context_id: string | null;
  descendant_reachability: any;
  resolution_source: 'SERVER_SIDE_VALIDATION';
}
