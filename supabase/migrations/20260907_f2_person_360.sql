-- ==========================================
-- F2 Person Workspace: get_person_360 RPC
-- ==========================================
-- Description: Universal Read-Model for Person Workspace
-- Implements F2 Visibility Matrix & Authorization Logic.
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_person_360(
    p_id_person UUID,
    p_pastoral_limit INT DEFAULT 10,
    p_pastoral_offset INT DEFAULT 0
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
    v_req_person UUID;
    
    v_target_exists BOOLEAN;
    
    v_target_active_mupel_ids TEXT[] := ARRAY[]::TEXT[];
    v_target_active_induk_ids TEXT[] := ARRAY[]::TEXT[];
    
    v_is_self BOOLEAN;
    v_is_superuser BOOLEAN;
    v_is_same_mupel BOOLEAN;
    v_is_same_jemaat BOOLEAN;
    
    v_can_see_private BOOLEAN := FALSE;
    v_can_see_restricted BOOLEAN := FALSE;
    v_can_see_public_ctx BOOLEAN := FALSE;
    
    -- Variables for data gathering
    v_person_rec RECORD;
    v_assignments JSONB := '[]'::JSONB;
    v_mutations JSONB := '[]'::JSONB;
    v_pastoral_logs JSONB := '[]'::JSONB;
    v_pastoral_total INT := 0;
    v_has_more_pastoral BOOLEAN := FALSE;
    
    v_limit INT;
    v_offset INT;
    
    v_reason_private TEXT;
    v_reason_restricted TEXT;
    v_reason_public_ctx TEXT;
    
    v_result JSONB;
BEGIN
    -- 1. Clamp Pagination
    v_limit := GREATEST(1, LEAST(p_pastoral_limit, 100));
    v_offset := GREATEST(0, p_pastoral_offset);

    -- 2. Trusted Session Check
    v_requester_uid := auth.uid();
    IF v_requester_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 3. Requester Scope Resolution
    SELECT role, id_mupel, id_induk, id_person 
    INTO v_req_role, v_req_mupel, v_req_induk, v_req_person
    FROM public.users 
    WHERE id = v_requester_uid;

    -- 4. Target Resolution
    SELECT EXISTS (SELECT 1 FROM public.m_person WHERE id_person = p_id_person) INTO v_target_exists;
    IF NOT v_target_exists THEN
        RETURN NULL; -- 404 behavior handled by API layer
    END IF;

    SELECT * INTO v_person_rec FROM public.m_person WHERE id_person = p_id_person;

    -- 5. Target Active Organizational Context Resolution
    -- A. Pendeta (if any)
    SELECT array_agg(DISTINCT p.id_induk) FILTER (WHERE p.id_induk IS NOT NULL),
           array_agg(DISTINCT j.id_mupel) FILTER (WHERE j.id_mupel IS NOT NULL)
    INTO v_target_active_induk_ids, v_target_active_mupel_ids
    FROM public.m_pendeta p
    LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
    WHERE p.id_person = p_id_person AND p.status = 'Aktif';

    -- B. Pelayan (if any, append to array)
    -- Assuming t_pelayan has id_induk and id_mupel. If it only has id_pos, we need to join m_pos_pelkes.
    -- (We use coalesce and array_cat to merge active contexts)
    DECLARE
        v_pelayan_induk TEXT[];
        v_pelayan_mupel TEXT[];
        v_relawan_induk TEXT[];
        v_relawan_mupel TEXT[];
    BEGIN
        -- t_pelayan context
        -- Temporarily bypassed or simplified if columns don't exist yet
        /*
        SELECT array_agg(DISTINCT p.id_induk) FILTER (WHERE p.id_induk IS NOT NULL),
               array_agg(DISTINCT j.id_mupel) FILTER (WHERE j.id_mupel IS NOT NULL)
        INTO v_pelayan_induk, v_pelayan_mupel
        FROM public.t_pelayan p
        LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE p.id_person = p_id_person;
        
        SELECT array_agg(DISTINCT r.id_induk) FILTER (WHERE r.id_induk IS NOT NULL),
               array_agg(DISTINCT j.id_mupel) FILTER (WHERE j.id_mupel IS NOT NULL)
        INTO v_relawan_induk, v_relawan_mupel
        FROM public.t_relawan r
        LEFT JOIN public.m_jemaat_induk j ON r.id_induk = j.id_induk
        WHERE r.id_person = p_id_person;
        */
        v_pelayan_induk := ARRAY[]::TEXT[];
        v_pelayan_mupel := ARRAY[]::TEXT[];
        v_relawan_induk := ARRAY[]::TEXT[];
        v_relawan_mupel := ARRAY[]::TEXT[];

        v_target_active_induk_ids := array_cat(v_target_active_induk_ids, array_cat(v_pelayan_induk, v_relawan_induk));
        v_target_active_mupel_ids := array_cat(v_target_active_mupel_ids, array_cat(v_pelayan_mupel, v_relawan_mupel));
    END;

    -- 6. Evaluate Context Match
    v_is_self := (v_req_person = p_id_person);
    v_is_superuser := (v_req_role = 'super_user');
    
    v_is_same_mupel := (v_req_mupel = ANY(v_target_active_mupel_ids));
    v_is_same_jemaat := (v_req_induk = ANY(v_target_active_induk_ids));

    -- 7. Rule Hierarchy for Visibility
    IF v_is_self OR v_is_superuser THEN
        v_can_see_private := TRUE;
        v_can_see_restricted := TRUE;
        v_can_see_public_ctx := TRUE;
    ELSIF v_req_role = 'admin_mupel' AND v_is_same_mupel THEN
        v_can_see_private := FALSE;
        v_can_see_restricted := TRUE;
        v_can_see_public_ctx := TRUE;
        v_reason_private := 'INSUFFICIENT_PERMISSION';
    ELSIF v_is_same_jemaat THEN
        v_can_see_private := FALSE;
        v_can_see_restricted := FALSE;
        v_can_see_public_ctx := TRUE;
        v_reason_private := 'INSUFFICIENT_PERMISSION';
        v_reason_restricted := 'INSUFFICIENT_PERMISSION';
    ELSE
        -- Outside Context
        v_can_see_private := FALSE;
        v_can_see_restricted := FALSE;
        v_can_see_public_ctx := FALSE;
        v_reason_private := 'OUTSIDE_CONTEXT';
        v_reason_restricted := 'OUTSIDE_CONTEXT';
        v_reason_public_ctx := 'OUTSIDE_CONTEXT';
    END IF;

    -- Gather PersonAssignments
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_assignment', p.id_pendeta,
            'role_type', 'PENDETA',
            'jabatan', p.jabatan,
            'organization_name', COALESCE(ji.nama_induk, m.nama_mupel, 'GPIB'),
            'status', CASE WHEN p.status = 'Aktif' THEN 'ACTIVE' ELSE 'INACTIVE' END,
            'start_date', p.tgl_tugas,
            'end_date', NULL -- Simplified for now
        )
    ), '[]'::jsonb)
    INTO v_assignments
    FROM (SELECT p_id_person AS id_person) dummy
    LEFT JOIN public.m_pendeta p ON p.id_person = dummy.id_person
    LEFT JOIN public.m_jemaat_induk ji ON ji.id_induk = p.id_induk
    LEFT JOIN public.m_mupel m ON m.id_mupel = ji.id_mupel;

    -- Gather Pastoral Logs (with pagination)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_log', l.id_log,
            'tanggal', l.tgl,
            'tipe_layanan', l.kegiatan,
            'status', 'COMPLETED',
            'notes', CASE WHEN v_is_self THEN l.catatan ELSE NULL END -- STRICTLY SELF_ONLY
        )
    ), '[]'::jsonb)
    INTO v_pastoral_logs
    FROM (
        SELECT id_log, tgl, kegiatan, catatan 
        FROM public.t_log_pastoral 
        WHERE id_pendeta IN (SELECT id_pendeta FROM public.m_pendeta WHERE id_person = p_id_person)
        ORDER BY tgl DESC
        LIMIT v_limit + 1 OFFSET v_offset
    ) l;

    -- Check if has more
    IF jsonb_array_length(v_pastoral_logs) > v_limit THEN
        v_has_more_pastoral := TRUE;
        -- Remove the extra item
        v_pastoral_logs := v_pastoral_logs - CAST(v_limit AS int);
    END IF;

    -- Build UnifiedPersonData JSONB Response
    v_result := jsonb_build_object(
        'id_person', p_id_person,
        
        'identity', jsonb_build_object(
            'nama_lengkap', v_person_rec.nama_lengkap,
            'gelar_depan', NULL,
            'gelar_belakang', NULL,
            'foto_url', v_person_rec.foto_url
        ),
        
        'overview', jsonb_build_object(
            'current_role_label', (v_assignments->0->>'jabatan'), -- naive extraction for ORG_WIDE
            'current_organization_name', (v_assignments->0->>'organization_name'),
            'is_active', CASE WHEN v_can_see_public_ctx THEN TRUE ELSE NULL END,
            'recent_pastoral_count', CASE WHEN v_can_see_public_ctx THEN jsonb_array_length(v_pastoral_logs) ELSE NULL END,
            'affiliation_origin', 'Organik GPIB',
            '_meta', jsonb_build_object(
                'is_active', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT', 'reason', v_reason_public_ctx),
                'recent_pastoral_count', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT', 'reason', v_reason_public_ctx)
            )
        ),
        
        'profile', jsonb_build_object(
            'data', jsonb_build_object(
                'tempat_lahir', NULL,
                'tanggal_lahir', CASE WHEN v_can_see_restricted THEN v_person_rec.tgl_lahir ELSE NULL END,
                'no_hp', CASE WHEN v_can_see_restricted THEN v_person_rec.no_wa ELSE NULL END,
                'email', NULL,
                'alamat_tinggal', NULL,
                'keluarga', CASE WHEN v_can_see_private THEN '[]'::jsonb ELSE NULL END, -- Family data mock for now
                'kontak_darurat', CASE WHEN v_can_see_private THEN '[]'::jsonb ELSE NULL END,
                'biometric_devices', CASE WHEN v_can_see_private THEN '[]'::jsonb ELSE NULL END
            ),
            '_meta', jsonb_build_object(
                'tempat_lahir', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'tanggal_lahir', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'no_hp', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'email', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'alamat_tinggal', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'keluarga', jsonb_build_object('accessible', v_can_see_private, 'visibility', 'PRIVATE', 'reason', v_reason_private),
                'kontak_darurat', jsonb_build_object('accessible', v_can_see_private, 'visibility', 'PRIVATE', 'reason', v_reason_private),
                'biometric_devices', jsonb_build_object('accessible', v_can_see_private, 'visibility', 'PRIVATE', 'reason', v_reason_private)
            )
        ),
        
        'roles', jsonb_build_object(
            'data', jsonb_build_object(
                'assignments', CASE WHEN v_can_see_public_ctx THEN v_assignments ELSE NULL END,
                'mutations', CASE WHEN v_can_see_restricted THEN '[]'::jsonb ELSE NULL END
            ),
            '_meta', jsonb_build_object(
                'assignments', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT', 'reason', v_reason_public_ctx),
                'mutations', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted)
            )
        ),
        
        'competencies', jsonb_build_object(
            'data', jsonb_build_object(
                'skills', '[]'::jsonb,
                'education', '[]'::jsonb,
                'certifications', '[]'::jsonb
            ),
            '_meta', jsonb_build_object(
                'skills', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'education', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'certifications', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE')
            )
        ),
        
        'pastoral', jsonb_build_object(
            'data', jsonb_build_object(
                'upcoming_schedules', CASE WHEN v_can_see_public_ctx THEN '[]'::jsonb ELSE NULL END,
                'pastoral_logs', CASE WHEN v_can_see_restricted THEN v_pastoral_logs ELSE NULL END
            ),
            'pagination', jsonb_build_object(
                'pastoral_logs', jsonb_build_object('limit', v_limit, 'offset', v_offset, 'has_more', v_has_more_pastoral)
            ),
            '_meta', jsonb_build_object(
                'upcoming_schedules', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT', 'reason', v_reason_public_ctx),
                'pastoral_logs', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'notes', jsonb_build_object('accessible', v_is_self, 'visibility', 'PRIVATE', 'reason', CASE WHEN v_is_self THEN NULL ELSE 'SELF_ONLY' END)
            )
        )
    );

    RETURN v_result;
END;
$$;
