-- ============================================================================
-- F12 HIERARCHICAL AUTHORIZATION & POLICY ENGINE MIGRATION
-- Reference Implementation #11 (RBAC/ABAC PDP, Data-Driven Hierarchy & RLS Boundary)
-- ============================================================================

-- 1. PHYSICAL POLICY RULES DEFINITION TABLE
CREATE TABLE IF NOT EXISTS public.sys_policy_rules (
    policy_id TEXT PRIMARY KEY DEFAULT ('POL-' || gen_random_uuid()::text),
    policy_name TEXT NOT NULL,
    policy_version TEXT NOT NULL DEFAULT '1.0.0',
    target_resource_type TEXT NOT NULL,
    allowed_actions TEXT[] NOT NULL,
    required_role TEXT NOT NULL,
    allowed_scope_type TEXT NOT NULL DEFAULT 'JEMAAT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PHYSICAL TRUSTED ROLE & ORG SCOPE ASSIGNMENTS TABLE (SERVER RESOLVED)
CREATE TABLE IF NOT EXISTS public.sys_role_assignments (
    assignment_id TEXT PRIMARY KEY DEFAULT ('RAS-' || gen_random_uuid()::text),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role_name TEXT NOT NULL,
    context_id TEXT NOT NULL,
    authority_boundary TEXT,
    is_delegated BOOLEAN NOT NULL DEFAULT FALSE,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Policy Decision Point (PDP) Querying
CREATE INDEX IF NOT EXISTS idx_policy_rules_lookup ON public.sys_policy_rules (target_resource_type, is_active);
CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON public.sys_role_assignments (user_id, role_name, context_id);

-- Enable RLS
ALTER TABLE public.sys_policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_role_assignments ENABLE ROW LEVEL SECURITY;

-- Default Read-Only RLS Policies for Policy Metadata
DROP POLICY IF EXISTS p_sys_policy_rules_read ON public.sys_policy_rules;
CREATE POLICY p_sys_policy_rules_read ON public.sys_policy_rules FOR SELECT TO authenticated USING (is_active = TRUE);

DROP POLICY IF EXISTS p_sys_role_assignments_read ON public.sys_role_assignments;
CREATE POLICY p_sys_role_assignments_read ON public.sys_role_assignments FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 3. RECURSIVE HIERARCHY RESOLUTION FUNCTION (DATA-DRIVEN PARENT-CHILD TRAVERSAL)
CREATE OR REPLACE FUNCTION public.resolve_org_authority_hierarchy(p_start_context_id TEXT)
RETURNS TABLE (context_id TEXT, depth INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE org_tree AS (
        SELECT id AS context_id, parent_id, 0 AS depth
        FROM public.org_unit
        WHERE id = p_start_context_id
        
        UNION ALL
        
        SELECT u.id AS context_id, u.parent_id, t.depth + 1
        FROM public.org_unit u
        INNER JOIN org_tree t ON u.id = t.parent_id
    )
    SELECT ot.context_id, ot.depth FROM org_tree ot;
END;
$$;

-- 4. POLICY DECISION POINT (PDP) EVALUATION RPC (SERVER-RECONSTRUCTED AUTHORITY)
CREATE OR REPLACE FUNCTION public.evaluate_authorization_policy(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_resource_org_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_role_rec RECORD;
    v_policy RECORD;
    v_evaluated_at TIMESTAMPTZ := NOW();
    v_is_authorized BOOLEAN := FALSE;
    v_matched_policy_id TEXT := NULL;
    v_matched_policy_ver TEXT := '1.0.0';
    v_denial_reason TEXT := 'DENIED_DEFAULT';
    v_denial_msg TEXT := 'No matching ALLOW policy rule found (Deny by default).';
    v_covered_orgs TEXT[];
BEGIN
    -- Guardrail 1: Fail Closed on Unauthenticated
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RETURN jsonb_build_object(
            'effect', 'DENY',
            'policy_id', NULL,
            'policy_version', '1.0.0',
            'evaluated_at', v_evaluated_at,
            'reason_code', 'DENIED_UNAUTHENTICATED',
            'denial_message', 'Unauthenticated requests evaluate to DENY.'
        );
    END IF;

    -- Look up matching active policies for this resource type and action
    FOR v_policy IN 
        SELECT * FROM public.sys_policy_rules
        WHERE target_resource_type = p_resource_type
          AND p_action = ANY(allowed_actions)
          AND is_active = TRUE
    LOOP
        -- Temporal validity window check
        IF v_policy.valid_from IS NOT NULL AND v_evaluated_at < v_policy.valid_from THEN
            v_denial_reason := 'DENIED_TEMPORAL_EXPIRED';
            v_denial_msg := 'Policy rule is not yet valid.';
            CONTINUE;
        END IF;

        IF v_policy.valid_until IS NOT NULL AND v_evaluated_at > v_policy.valid_until THEN
            v_denial_reason := 'DENIED_TEMPORAL_EXPIRED';
            v_denial_msg := 'Policy rule has expired.';
            CONTINUE;
        END IF;

        -- Verify caller has server-resolved matching role assignment
        FOR v_role_rec IN
            SELECT * FROM public.sys_role_assignments
            WHERE user_id = v_uid
              AND role_name = v_policy.required_role
              AND (valid_until IS NULL OR valid_until > v_evaluated_at)
        LOOP
            -- If resource org id is specified, check tenant/hierarchy scope
            IF p_resource_org_id IS NOT NULL THEN
                -- Resolve hierarchy of caller role context
                SELECT ARRAY_AGG(h.context_id) INTO v_covered_orgs
                FROM public.resolve_org_authority_hierarchy(v_role_rec.context_id) h;

                IF NOT (p_resource_org_id = ANY(v_covered_orgs)) THEN
                    v_denial_reason := 'DENIED_TENANT_BOUNDARY';
                    v_denial_msg := 'Subject org authority boundary does not cover target resource org context.';
                    CONTINUE;
                END IF;
            END IF;

            -- Explicit Allow matched!
            RETURN jsonb_build_object(
                'effect', 'ALLOW',
                'policy_id', v_policy.policy_id,
                'policy_version', v_policy.policy_version,
                'evaluated_at', v_evaluated_at,
                'reason_code', 'ALLOWED_EXPLICIT_POLICY',
                'granted_scope', v_role_rec.context_id
            );
        END LOOP;
    END LOOP;

    -- Return Deny Decision with explicit Reason Code
    RETURN jsonb_build_object(
        'effect', 'DENY',
        'policy_id', v_matched_policy_id,
        'policy_version', v_matched_policy_ver,
        'evaluated_at', v_evaluated_at,
        'reason_code', v_denial_reason,
        'denial_message', v_denial_msg
    );
END;
$$;

-- 5. RLS POLICY ENFORCEMENT HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.enforce_rbac_abac_policy(
    p_resource_type TEXT,
    p_resource_org_id TEXT,
    p_action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_decision JSONB;
BEGIN
    v_decision := public.evaluate_authorization_policy(p_action, p_resource_type, NULL, p_resource_org_id);
    RETURN (v_decision->>'effect') = 'ALLOW';
END;
$$;

-- 6. SEED DEFAULT SYSTEM POLICY RULES
INSERT INTO public.sys_policy_rules (
    policy_id, policy_name, policy_version, target_resource_type, allowed_actions, required_role, allowed_scope_type
) VALUES 
    ('POL-PERSON-READ', 'Person Profile Read Policy', '1.0.0', 'person', ARRAY['read'], 'SECTOR_SECRETARY', 'SEKTOR'),
    ('POL-PERSON-WRITE', 'Person Profile Mutation Policy', '1.0.0', 'person', ARRAY['write', 'read'], 'ADMIN_JEMAAT', 'JEMAAT'),
    ('POL-AID-APPROVE', 'Aid Request Approval Policy', '1.0.0', 'aid_request', ARRAY['approve', 'read'], 'FINANCE_COMMISSIONER', 'JEMAAT'),
    ('POL-QUEUE-EXECUTE', 'Bulk Queue Execution Policy', '1.0.0', 'batch_queue', ARRAY['execute', 'read'], 'DEVELOPER_ADMIN', 'SINODE')
ON CONFLICT (policy_id) DO UPDATE SET
    allowed_actions = EXCLUDED.allowed_actions,
    required_role = EXCLUDED.required_role;
