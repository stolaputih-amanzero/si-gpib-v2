export type PolicyEffect = 'ALLOW' | 'DENY';

export type PolicyDecisionReasonCode = 
  | 'ALLOWED_EXPLICIT_POLICY'
  | 'DENIED_DEFAULT'
  | 'DENIED_SCOPE_MISMATCH'
  | 'DENIED_PRIVILEGE_ESCALATION'
  | 'DENIED_TENANT_BOUNDARY'
  | 'DENIED_TEMPORAL_EXPIRED'
  | 'DENIED_ABAC_CONSTRAINT'
  | 'DENIED_UNAUTHENTICATED';

export type AuthorizationAction = 
  | 'read' 
  | 'write' 
  | 'delete' 
  | 'execute' 
  | 'admin' 
  | 'approve' 
  | 'export';

export interface OrganizationScopeNode {
  context_id: string;
  parent_context_id: string | null;
  scope_type: string;
  authority_boundary: string;
}

export interface AuthorizationSubject {
  subject_id: string;
  user_id: string;
  resolved_roles: string[];
  active_org_scope: OrganizationScopeNode;
  attributes: Record<string, string | number | boolean>;
}

export interface AuthorizationResource {
  resource_id: string;
  resource_type: string;
  org_context_id: string;
  owner_id?: string | null;
  attributes: Record<string, string | number | boolean>;
}

export interface DelegationContext {
  delegator_id: string;
  delegate_id: string;
  valid_until: string;
  allowed_actions: AuthorizationAction[];
}

export interface AuthorizationContext {
  timestamp: string;
  client_ip?: string;
  location?: string;
  is_delegated?: boolean;
  delegation?: DelegationContext;
}

export interface TemporalPolicyWindow {
  valid_from: string;
  valid_until: string;
}

export interface AuthorizationRequest {
  request_id: string;
  subject: AuthorizationSubject;
  action: AuthorizationAction;
  resource: AuthorizationResource;
  context: AuthorizationContext;
}

interface BasePolicyDecision {
  request_id: string;
  policy_version: string;
  evaluated_at: string;
}

export interface AllowPolicyDecision extends BasePolicyDecision {
  effect: 'ALLOW';
  policy_id: string;
  reason_code: 'ALLOWED_EXPLICIT_POLICY';
  granted_scope: string;
}

export interface DenyPolicyDecision extends BasePolicyDecision {
  effect: 'DENY';
  policy_id: string | null;
  reason_code: PolicyDecisionReasonCode;
  denial_message: string;
}

export type PolicyDecision = AllowPolicyDecision | DenyPolicyDecision;

export interface PolicyRuleDefinition {
  policy_id: string;
  policy_name: string;
  policy_version: string;
  target_resource_type: string;
  allowed_actions: AuthorizationAction[];
  required_role: string;
  allowed_scope_type: string;
  temporal_window?: TemporalPolicyWindow;
}

// Pure PDP Evaluation Helper Function (Deterministic Evaluation Engine)
export function evaluateAuthorizationRequest(
  request: AuthorizationRequest,
  policies: PolicyRuleDefinition[]
): PolicyDecision {
  const evaluated_at = new Date().toISOString();

  // Guardrail 1: Unauthenticated check
  if (!request.subject.user_id || request.subject.user_id === 'ANONYMOUS') {
    return {
      request_id: request.request_id,
      effect: 'DENY',
      policy_id: null,
      policy_version: '1.0.0',
      evaluated_at,
      reason_code: 'DENIED_UNAUTHENTICATED',
      denial_message: 'Unauthenticated requests evaluate to DENY.'
    };
  }

  // Guardrail 2: Deny by default if no matching policy
  const matchingPolicy = policies.find(p => 
    p.target_resource_type === request.resource.resource_type &&
    p.allowed_actions.includes(request.action) &&
    request.subject.resolved_roles.includes(p.required_role)
  );

  if (!matchingPolicy) {
    return {
      request_id: request.request_id,
      effect: 'DENY',
      policy_id: null,
      policy_version: '1.0.0',
      evaluated_at,
      reason_code: 'DENIED_DEFAULT',
      denial_message: 'No matching ALLOW policy rule found (Deny by default).'
    };
  }

  // Guardrail 3: Organization Tenant Boundary Check
  if (request.resource.org_context_id !== request.subject.active_org_scope.context_id &&
      request.resource.org_context_id !== request.subject.active_org_scope.parent_context_id) {
    return {
      request_id: request.request_id,
      effect: 'DENY',
      policy_id: matchingPolicy.policy_id,
      policy_version: matchingPolicy.policy_version,
      evaluated_at,
      reason_code: 'DENIED_TENANT_BOUNDARY',
      denial_message: 'Subject org scope does not cover resource org context boundary.'
    };
  }

  // Guardrail 4: Temporal Window Check
  if (matchingPolicy.temporal_window) {
    const now = new Date(request.context.timestamp).getTime();
    const validFrom = new Date(matchingPolicy.temporal_window.valid_from).getTime();
    const validUntil = new Date(matchingPolicy.temporal_window.valid_until).getTime();

    if (now < validFrom || now > validUntil) {
      return {
        request_id: request.request_id,
        effect: 'DENY',
        policy_id: matchingPolicy.policy_id,
        policy_version: matchingPolicy.policy_version,
        evaluated_at,
        reason_code: 'DENIED_TEMPORAL_EXPIRED',
        denial_message: 'Authorization request timestamp is outside policy validity window.'
      };
    }
  }

  // Explicit Allow
  return {
    request_id: request.request_id,
    effect: 'ALLOW',
    policy_id: matchingPolicy.policy_id,
    policy_version: matchingPolicy.policy_version,
    evaluated_at,
    reason_code: 'ALLOWED_EXPLICIT_POLICY',
    granted_scope: request.subject.active_org_scope.context_id
  };
}
