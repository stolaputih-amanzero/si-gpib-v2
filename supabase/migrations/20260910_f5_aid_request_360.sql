-- ==========================================
-- F5 Aid Request Entity: Read RPC & Atomic Transition RPC
-- ==========================================
-- Description: Universal Read-Model (get_aid_request_360) and 
-- Atomic Workflow State Transition (transition_aid_request_atomic).
-- Implements WORKSPACE_PATTERN_V1.1 & Aid Request Contract v0.1.
-- ==========================================

-- 0. Ensure System Transaction Logs Table for Idempotency
CREATE TABLE IF NOT EXISTS public.sys_transaction_logs (
    request_id TEXT PRIMARY KEY,
    id_ajuan TEXT NOT NULL,
    action TEXT NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 1. QUERY RPC: get_aid_request_360(p_id_ajuan)
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_aid_request_360(
    p_id_ajuan TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_requester_uid UUID;
    v_req_role TEXT;
    v_req_mupel TEXT;
    v_req_induk TEXT;

    v_match_count INT := 0;

    -- Aid Request Record Data
    v_id_pos TEXT;
    v_jenis_bantuan TEXT;
    v_id_tanah TEXT;
    v_id_bangunan TEXT;
    v_id_aset_b TEXT;
    v_biaya DECIMAL(15,2);
    v_urgensi TEXT;
    v_status TEXT;
    v_keterangan TEXT;
    v_created_at TIMESTAMPTZ;

    -- Ownership Context
    v_nama_pos TEXT;
    v_id_induk TEXT;
    v_id_mupel TEXT;

    -- Relationship Context & Access Control
    v_is_superuser BOOLEAN := FALSE;
    v_is_same_tree BOOLEAN := FALSE;
    v_can_see_restricted BOOLEAN := FALSE;
    v_reason_restricted TEXT := NULL;

    -- Approval History
    v_approval_history JSONB := '[]'::JSONB;

    v_result JSONB;
BEGIN
    -- 1. Trusted Session Check
    v_requester_uid := auth.uid();
    IF v_requester_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Requester Scope Resolution
    SELECT role, id_mupel, id_induk 
    INTO v_req_role, v_req_mupel, v_req_induk
    FROM public.users 
    WHERE id = v_requester_uid;

    v_is_superuser := (COALESCE(v_req_role, '') = 'super_user');

    -- 3. Deterministic Identity Resolution (NO LIMIT 1)
    IF p_id_ajuan IS NULL OR TRIM(p_id_ajuan) = '' THEN
        RETURN NULL;
    END IF;

    SELECT COUNT(*) INTO v_match_count 
    FROM public.t_pengajuan_bantuan 
    WHERE id_ajuan = p_id_ajuan;

    IF v_match_count <> 1 THEN
        RETURN NULL; -- Return NULL for 0 or ambiguous matches (NO GUESSING)
    END IF;

    -- 4. Load Primary Aid Request Record
    SELECT 
        id_pos, jenis_bantuan, id_tanah, id_bangunan, id_aset_b,
        biaya, urgensi, COALESCE(status, 'Draft'), keterangan, created_at
    INTO 
        v_id_pos, v_jenis_bantuan, v_id_tanah, v_id_bangunan, v_id_aset_b,
        v_biaya, v_urgensi, v_status, v_keterangan, v_created_at
    FROM public.t_pengajuan_bantuan
    WHERE id_ajuan = p_id_ajuan;

    -- 5. Load Ownership Context
    SELECT p.nama_pos, p.id_induk, j.id_mupel
    INTO v_nama_pos, v_id_induk, v_id_mupel
    FROM public.m_pos_pelkes p
    LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
    WHERE p.id_pos = v_id_pos;

    -- 6. Evaluate Relationship Context & Access Control
    IF v_is_superuser THEN
        v_is_same_tree := TRUE;
    ELSE
        v_is_same_tree := (v_req_induk = v_id_induk OR v_req_mupel = v_id_mupel);
    END IF;

    v_can_see_restricted := v_is_superuser OR (v_is_same_tree AND v_req_role IN ('kmj', 'admin_mupel', 'pj'));

    IF NOT v_can_see_restricted THEN
        v_reason_restricted := CASE WHEN NOT v_is_same_tree THEN 'OUTSIDE_CONTEXT' ELSE 'INSUFFICIENT_PERMISSION' END;
    END IF;

    -- 7. Projection: Approval History (Restricted)
    IF v_can_see_restricted THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id', id,
                'role_approver', role_approver,
                'aksi', aksi,
                'catatan', catatan,
                'created_at', created_at
            ) ORDER BY created_at ASC
        ), '[]'::JSONB) INTO v_approval_history
        FROM public.t_approval_bantuan
        WHERE id_ajuan = p_id_ajuan;
    END IF;

    -- 8. Construct Final Unified JSON Payload
    -- Invariant: SYSTEM_ONLY fields (updated_at, created_by) are strictly EXCLUDED
    v_result := jsonb_build_object(
        'id_ajuan', p_id_ajuan,
        'identity', jsonb_build_object(
            'id_ajuan', p_id_ajuan,
            'jenis_bantuan', v_jenis_bantuan,
            'urgensi', v_urgensi
        ),
        'ownership', jsonb_build_object(
            'id_pos', v_id_pos,
            'nama_organisasi', COALESCE(v_nama_pos, 'Organisasi Pemohon'),
            'org_level', 'POS_PELKES'
        ),
        'workflow', jsonb_build_object(
            'status', v_status,
            'created_at', v_created_at
        ),
        'proposal', CASE 
            WHEN v_can_see_restricted THEN jsonb_build_object(
                'biaya', v_biaya,
                'keterangan', v_keterangan,
                'id_tanah', v_id_tanah,
                'id_bangunan', v_id_bangunan,
                'id_aset_b', v_id_aset_b
            )
            ELSE NULL 
        END,
        'approval_history', v_approval_history,
        'context', jsonb_build_object(
            'requester_access_level', CASE WHEN v_can_see_restricted THEN 'FULL_ADMIN' WHEN v_is_same_tree THEN 'STANDARD' ELSE 'UNAUTHENTICATED' END,
            'is_same_ancestral_tree', v_is_same_tree
        ),
        '_meta', jsonb_build_object(
            'privacy', jsonb_build_object(
                'identity', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'ownership', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'workflow', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'proposal', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'approval_history', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted)
            )
        )
    );

    RETURN v_result;
END;
$$;


-- ==========================================
-- 2. COMMAND RPC: transition_aid_request_atomic(...)
-- ==========================================
CREATE OR REPLACE FUNCTION public.transition_aid_request_atomic(
    p_id_ajuan TEXT,
    p_action TEXT,
    p_catatan TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_requester_uid UUID;
    v_req_role TEXT;
    v_req_mupel TEXT;
    v_req_induk TEXT;

    v_action TEXT;
    v_current_status TEXT;
    v_target_status TEXT;
    v_id_pos TEXT;
    v_id_induk TEXT;
    v_id_mupel TEXT;

    v_is_superuser BOOLEAN := FALSE;
    v_is_authorized BOOLEAN := FALSE;
BEGIN
    -- 1. Trusted Session Check
    v_requester_uid := auth.uid();
    IF v_requester_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Idempotency Guard (via sys_transaction_logs)
    IF p_request_id IS NOT NULL AND TRIM(p_request_id) <> '' THEN
        IF EXISTS (SELECT 1 FROM public.sys_transaction_logs WHERE request_id = p_request_id) THEN
            -- Already processed: return current read model safely
            RETURN public.get_aid_request_360(p_id_ajuan);
        END IF;
    END IF;

    -- 3. Requester Scope Resolution
    SELECT role, id_mupel, id_induk 
    INTO v_req_role, v_req_mupel, v_req_induk
    FROM public.users 
    WHERE id = v_requester_uid;

    v_is_superuser := (COALESCE(v_req_role, '') = 'super_user');

    -- 4. Lock Target Aid Request & Load Current Status
    SELECT status, id_pos INTO v_current_status, v_id_pos
    FROM public.t_pengajuan_bantuan
    WHERE id_ajuan = p_id_ajuan
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'AID_REQUEST_NOT_FOUND';
    END IF;

    -- Load Owner Org Scope
    SELECT p.id_induk, j.id_mupel
    INTO v_id_induk, v_id_mupel
    FROM public.m_pos_pelkes p
    LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
    WHERE p.id_pos = v_id_pos;

    -- 5. Validate State Machine Transition & Evaluate Authorization Boundary
    v_action := LOWER(TRIM(p_action));

    IF v_current_status = 'Draft' THEN
        IF v_action = 'submit' THEN
            v_target_status := 'Pending_KMJ';
            v_is_authorized := v_is_superuser OR (v_req_induk = v_id_induk OR v_req_mupel = v_id_mupel);
        ELSE
            RAISE EXCEPTION 'INVALID_TRANSITION';
        END IF;

    ELSIF v_current_status = 'Pending_KMJ' THEN
        IF v_action = 'approve' THEN
            v_target_status := 'Pending_Mupel';
            v_is_authorized := v_is_superuser OR (v_req_role = 'kmj' AND v_req_induk = v_id_induk);
        ELSIF v_action = 'reject' THEN
            v_target_status := 'Rejected';
            v_is_authorized := v_is_superuser OR (v_req_role = 'kmj' AND v_req_induk = v_id_induk);
        ELSE
            RAISE EXCEPTION 'INVALID_TRANSITION';
        END IF;

    ELSIF v_current_status = 'Pending_Mupel' THEN
        IF v_action = 'approve' THEN
            v_target_status := 'Pending_Sinode';
            v_is_authorized := v_is_superuser OR (v_req_role = 'admin_mupel' AND v_req_mupel = v_id_mupel);
        ELSIF v_action = 'reject' THEN
            v_target_status := 'Rejected';
            v_is_authorized := v_is_superuser OR (v_req_role = 'admin_mupel' AND v_req_mupel = v_id_mupel);
        ELSE
            RAISE EXCEPTION 'INVALID_TRANSITION';
        END IF;

    ELSIF v_current_status = 'Pending_Sinode' THEN
        IF v_action = 'approve' THEN
            v_target_status := 'Approved';
            v_is_authorized := v_is_superuser;
        ELSIF v_action = 'reject' THEN
            v_target_status := 'Rejected';
            v_is_authorized := v_is_superuser;
        ELSE
            RAISE EXCEPTION 'INVALID_TRANSITION';
        END IF;

    ELSE
        -- Terminal state (Approved / Rejected) cannot be transitioned
        RAISE EXCEPTION 'INVALID_TRANSITION';
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'INSUFFICIENT_PERMISSION';
    END IF;

    -- 6. Perform Atomic Mutation (State Update + Approval Audit Log Insertion)
    UPDATE public.t_pengajuan_bantuan
    SET status = v_target_status,
        updated_at = NOW()
    WHERE id_ajuan = p_id_ajuan;

    INSERT INTO public.t_approval_bantuan (
        id_ajuan, approver_id, role_approver, aksi, catatan, created_at
    ) VALUES (
        p_id_ajuan,
        v_requester_uid,
        COALESCE(v_req_role, 'user'),
        v_action,
        p_catatan,
        NOW()
    );

    -- Log Idempotency Token
    IF p_request_id IS NOT NULL AND TRIM(p_request_id) <> '' THEN
        INSERT INTO public.sys_transaction_logs (request_id, id_ajuan, action)
        VALUES (p_request_id, p_id_ajuan, v_action)
        ON CONFLICT (request_id) DO NOTHING;
    END IF;

    -- 7. Return Updated Read Model Payload
    RETURN public.get_aid_request_360(p_id_ajuan);
END;
$$;
