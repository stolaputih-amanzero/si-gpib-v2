-- ==========================================
-- F3 Organization Workspace: get_organization_360 RPC
-- ==========================================
-- Description: Universal Read-Model for Organization Workspace
-- Implements WORKSPACE_PATTERN_V1 & Contract v0.3.
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_organization_360(
    p_id_org TEXT
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

    -- Resolution variables
    v_org_level TEXT := NULL;
    v_canonical_id TEXT := NULL;
    v_match_count INT := 0;
    v_cnt INT := 0;

    -- Target Organization Record / Fields
    v_name TEXT;
    v_keterangan TEXT;
    v_alamat TEXT;
    v_latitude DECIMAL(10,7);
    v_longitude DECIMAL(10,7);
    v_tgl_berdiri DATE;
    v_status TEXT := 'Aktif';

    v_parent_id TEXT := NULL;
    v_parent_name TEXT := NULL;
    v_parent_level TEXT := NULL;

    v_target_mupel_id TEXT := NULL;
    v_target_induk_id TEXT := NULL;
    v_target_pos_ids TEXT[] := ARRAY[]::TEXT[];

    -- Context & Visibility Evaluation
    v_is_superuser BOOLEAN := FALSE;
    v_is_same_tree BOOLEAN := FALSE;
    v_is_exact_node BOOLEAN := FALSE;

    v_can_see_restricted BOOLEAN := FALSE;
    v_can_see_private BOOLEAN := FALSE;
    v_can_see_public_ctx BOOLEAN := FALSE;

    v_reason_restricted TEXT := NULL;
    v_reason_private TEXT := NULL;

    -- Aggregation Data Variables
    v_kmj_id_person UUID := NULL;
    v_kmj_nama TEXT := NULL;

    v_children JSONB := '[]'::JSONB;
    v_ancestors JSONB := '[]'::JSONB;

    v_pj_list JSONB := '[]'::JSONB;
    v_pelayan_list JSONB := '[]'::JSONB;
    v_relawan_list JSONB := '[]'::JSONB;

    v_total_pos_count INT := 0;
    v_total_pelayan_count INT := 0;

    v_assets_total INT := 0;
    v_assets_tanah INT := 0;
    v_assets_bangunan INT := 0;
    v_assets_bergerak INT := 0;
    v_asset_items JSONB := '[]'::JSONB;

    v_aid_total INT := 0;
    v_aid_active INT := 0;
    v_aid_approved INT := 0;
    v_aid_items JSONB := '[]'::JSONB;

    v_demografi JSONB := '[]'::JSONB;
    v_kerawanan JSONB := '[]'::JSONB;
    v_potensi JSONB := '[]'::JSONB;

    v_result JSONB;
BEGIN
    -- 1. Trusted Session Check
    v_requester_uid := auth.uid();
    IF v_requester_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED';
    END IF;

    -- 2. Requester Scope Resolution
    SELECT role, id_mupel, id_induk, id_person 
    INTO v_req_role, v_req_mupel, v_req_induk, v_req_person
    FROM public.users 
    WHERE id = v_requester_uid;

    v_is_superuser := (COALESCE(v_req_role, '') = 'super_user');

    -- 3. Deterministic Identity Resolution
    IF p_id_org IS NULL OR TRIM(p_id_org) = '' THEN
        RETURN NULL;
    END IF;

    -- Check exact match in m_pos_pelkes
    SELECT COUNT(*) INTO v_cnt FROM public.m_pos_pelkes WHERE id_pos = p_id_org;
    IF v_cnt > 0 THEN
        v_match_count := v_match_count + v_cnt;
        v_org_level := 'POS_PELKES';
        v_canonical_id := p_id_org;
    END IF;

    -- Check exact match in m_jemaat_induk
    SELECT COUNT(*) INTO v_cnt FROM public.m_jemaat_induk WHERE id_induk = p_id_org;
    IF v_cnt > 0 THEN
        v_match_count := v_match_count + v_cnt;
        v_org_level := 'JEMAAT_INDUK';
        v_canonical_id := p_id_org;
    END IF;

    -- Check exact match in m_mupel
    SELECT COUNT(*) INTO v_cnt FROM public.m_mupel WHERE id_mupel = p_id_org;
    IF v_cnt > 0 THEN
        v_match_count := v_match_count + v_cnt;
        v_org_level := 'MUPEL';
        v_canonical_id := p_id_org;
    END IF;

    -- Ambiguity Guard: Must resolve to EXACTLY 1 match
    IF v_match_count <> 1 THEN
        RETURN NULL; -- Return NULL for 0 or ambiguous matches (NO GUESSING)
    END IF;

    -- 4. Load Target Organization Data & Hierarchy Ancestry
    IF v_org_level = 'POS_PELKES' THEN
        SELECT p.nama_pos, p.keterangan, p.alamat, p.latitude, p.longitude, p.tgl_berdiri,
               p.id_induk, j.nama_induk, j.id_mupel
        INTO v_name, v_keterangan, v_alamat, v_latitude, v_longitude, v_tgl_berdiri,
             v_target_induk_id, v_parent_name, v_target_mupel_id
        FROM public.m_pos_pelkes p
        LEFT JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE p.id_pos = v_canonical_id;

        v_parent_id := v_target_induk_id;
        v_parent_level := 'JEMAAT_INDUK';
        v_target_pos_ids := ARRAY[v_canonical_id];

    ELSIF v_org_level = 'JEMAAT_INDUK' THEN
        SELECT j.nama_induk, j.keterangan, j.alamat, j.latitude, j.longitude, NULL::DATE,
               j.id_mupel, m.nama_mupel
        INTO v_name, v_keterangan, v_alamat, v_latitude, v_longitude, v_tgl_berdiri,
             v_target_mupel_id, v_parent_name
        FROM public.m_jemaat_induk j
        LEFT JOIN public.m_mupel m ON j.id_mupel = m.id_mupel
        WHERE j.id_induk = v_canonical_id;

        v_target_induk_id := v_canonical_id;
        v_parent_id := v_target_mupel_id;
        v_parent_level := 'MUPEL';

        SELECT array_agg(id_pos) INTO v_target_pos_ids 
        FROM public.m_pos_pelkes WHERE id_induk = v_canonical_id;

    ELSIF v_org_level = 'MUPEL' THEN
        SELECT nama_mupel, keterangan
        INTO v_name, v_keterangan
        FROM public.m_mupel
        WHERE id_mupel = v_canonical_id;

        v_target_mupel_id := v_canonical_id;
        v_parent_id := NULL;
        v_parent_level := NULL;

        SELECT array_agg(p.id_pos) INTO v_target_pos_ids
        FROM public.m_pos_pelkes p
        JOIN public.m_jemaat_induk j ON p.id_induk = j.id_induk
        WHERE j.id_mupel = v_canonical_id;
    END IF;

    -- Ensure non-null pos array
    IF v_target_pos_ids IS NULL THEN
        v_target_pos_ids := ARRAY[]::TEXT[];
    END IF;

    -- 5. Resolve Context & Tree Relationship
    IF v_is_superuser THEN
        v_is_same_tree := TRUE;
        v_is_exact_node := TRUE;
    ELSIF v_org_level = 'MUPEL' THEN
        v_is_same_tree := (v_req_mupel = v_canonical_id);
        v_is_exact_node := (v_req_mupel = v_canonical_id AND v_req_role = 'admin_mupel');
    ELSIF v_org_level = 'JEMAAT_INDUK' THEN
        v_is_same_tree := (v_req_induk = v_canonical_id OR v_req_mupel = v_target_mupel_id);
        v_is_exact_node := (v_req_induk = v_canonical_id);
    ELSIF v_org_level = 'POS_PELKES' THEN
        v_is_same_tree := (v_req_induk = v_target_induk_id OR v_req_mupel = v_target_mupel_id);
        v_is_exact_node := (v_req_induk = v_target_induk_id);
    END IF;

    -- Visibility Evaluation Rules
    v_can_see_public_ctx := v_is_same_tree OR v_is_superuser;
    v_can_see_restricted := v_is_same_tree OR v_is_superuser;
    v_can_see_private := (v_is_exact_node AND (v_req_role IN ('kmj', 'admin_mupel', 'pj'))) OR v_is_superuser;

    IF NOT v_can_see_restricted THEN
        v_reason_restricted := 'OUTSIDE_CONTEXT';
    END IF;

    IF NOT v_can_see_private THEN
        v_reason_private := 'INSUFFICIENT_PERMISSION';
    END IF;

    -- 6. Build Structure (Children & Ancestors)
    IF v_parent_id IS NOT NULL THEN
        v_ancestors := jsonb_build_array(
            jsonb_build_object(
                'id_org', v_parent_id,
                'nama', COALESCE(v_parent_name, v_parent_id),
                'org_level', v_parent_level
            )
        );
    END IF;

    IF v_org_level = 'MUPEL' THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_org', j.id_induk,
                'nama', j.nama_induk,
                'org_level', 'JEMAAT_INDUK',
                'count_sub', (SELECT COUNT(*) FROM public.m_pos_pelkes p WHERE p.id_induk = j.id_induk)
            )
        ), '[]'::JSONB) INTO v_children
        FROM public.m_jemaat_induk j
        WHERE j.id_mupel = v_canonical_id;

    ELSIF v_org_level = 'JEMAAT_INDUK' THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_org', p.id_pos,
                'nama', p.nama_pos,
                'org_level', 'POS_PELKES'
            )
        ), '[]'::JSONB) INTO v_children
        FROM public.m_pos_pelkes p
        WHERE p.id_induk = v_canonical_id;
    END IF;

    -- 7. Build People Projections
    -- KMJ for Jemaat Induk
    IF v_org_level = 'JEMAAT_INDUK' THEN
        SELECT p.id_person, p.nama_lengkap
        INTO v_kmj_id_person, v_kmj_nama
        FROM public.m_jemaat_induk j
        JOIN public.m_pendeta pend ON j.id_kmj = pend.id_pendeta
        JOIN public.m_person p ON pend.id_person = p.id_person
        WHERE j.id_induk = v_canonical_id;
    END IF;

    -- PJ List
    IF v_target_induk_id IS NOT NULL THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_person', COALESCE(p.id_person, '00000000-0000-0000-0000-000000000000'::UUID),
                'nama_lengkap', pend.nama_lengkap,
                'role_label', 'PJ',
                'status', COALESCE(pj.status, 'Aktif')
            )
        ), '[]'::JSONB) INTO v_pj_list
        FROM public.t_pj_jemaat pj
        JOIN public.m_pendeta pend ON pj.id_pendeta = pend.id_pendeta
        LEFT JOIN public.m_person p ON pend.id_person = p.id_person
        WHERE pj.id_induk = v_target_induk_id AND pj.status = 'Aktif';
    END IF;

    -- Pelayan List & Relawan List from Pos
    IF array_length(v_target_pos_ids, 1) > 0 THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_person', COALESCE(pel.id_person, '00000000-0000-0000-0000-000000000000'::UUID),
                'nama_lengkap', pel.nama,
                'role_label', COALESCE(pel.jabatan, 'Pelayan'),
                'status', COALESCE(pel.status, 'Aktif')
            )
        ), '[]'::JSONB) INTO v_pelayan_list
        FROM public.t_pelayan pel
        WHERE pel.id_pos = ANY(v_target_pos_ids);

        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_person', COALESCE(rel.id_person, '00000000-0000-0000-0000-000000000000'::UUID),
                'nama_lengkap', rel.nama,
                'role_label', COALESCE(rel.kategori, 'Relawan'),
                'status', 'Aktif'
            )
        ), '[]'::JSONB) INTO v_relawan_list
        FROM public.t_relawan rel
        WHERE rel.id_pos = ANY(v_target_pos_ids);
    END IF;

    v_total_pos_count := array_length(v_target_pos_ids, 1);
    v_total_pelayan_count := jsonb_array_length(v_pelayan_list) + jsonb_array_length(v_relawan_list);

    -- 8. Build Asset Projections
    IF array_length(v_target_pos_ids, 1) > 0 THEN
        SELECT COUNT(*) INTO v_assets_tanah FROM public.t_aset_tanah WHERE id_pos = ANY(v_target_pos_ids);
        SELECT COUNT(*) INTO v_assets_bangunan FROM public.t_aset_bangunan WHERE id_pos = ANY(v_target_pos_ids);
        SELECT COUNT(*) INTO v_assets_bergerak FROM public.t_aset_bergerak WHERE id_pos = ANY(v_target_pos_ids);
        
        v_assets_total := v_assets_tanah + v_assets_bangunan + v_assets_bergerak;

        IF v_can_see_restricted THEN
            SELECT COALESCE(jsonb_agg(item), '[]'::JSONB) INTO v_asset_items FROM (
                SELECT id_tanah AS id_asset, 'Tanah' AS nama_aset, 'tanah' AS kategori, kondisi, keterangan AS detail
                FROM public.t_aset_tanah WHERE id_pos = ANY(v_target_pos_ids)
                UNION ALL
                SELECT id_bangunan AS id_asset, COALESCE(fungsi, 'Gedung') AS nama_aset, 'bangunan' AS kategori, kondisi, keterangan AS detail
                FROM public.t_aset_bangunan WHERE id_pos = ANY(v_target_pos_ids)
                UNION ALL
                SELECT id_aset_b AS id_asset, COALESCE(jenis, 'Aset Bergerak') AS nama_aset, 'bergerak' AS kategori, kondisi, keterangan AS detail
                FROM public.t_aset_bergerak WHERE id_pos = ANY(v_target_pos_ids)
                LIMIT 20
            ) item;
        END IF;
    END IF;

    -- 9. Build Aid Request Projections
    IF array_length(v_target_pos_ids, 1) > 0 THEN
        SELECT COUNT(*) INTO v_aid_total FROM public.t_pengajuan_bantuan WHERE id_pos = ANY(v_target_pos_ids);
        SELECT COUNT(*) INTO v_aid_active FROM public.t_pengajuan_bantuan WHERE id_pos = ANY(v_target_pos_ids) AND status NOT IN ('Approved', 'Rejected');
        SELECT COUNT(*) INTO v_aid_approved FROM public.t_pengajuan_bantuan WHERE id_pos = ANY(v_target_pos_ids) AND status = 'Approved';

        IF v_can_see_restricted THEN
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id_ajuan', id_ajuan,
                    'jenis_bantuan', jenis_bantuan,
                    'biaya', biaya,
                    'urgensi', urgensi,
                    'status', COALESCE(status, 'Draft'),
                    'created_at', created_at
                )
            ), '[]'::JSONB) INTO v_aid_items
            FROM (
                SELECT id_ajuan, jenis_bantuan, biaya, urgensi, status, created_at
                FROM public.t_pengajuan_bantuan
                WHERE id_pos = ANY(v_target_pos_ids)
                ORDER BY created_at DESC
                LIMIT 20
            ) a;
        END IF;
    END IF;

    -- 10. Build Territory Projections
    IF array_length(v_target_pos_ids, 1) > 0 THEN
        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'kategori_pelkat', kategori_pelkat,
                'jml_kk', jml_kk,
                'laki', laki,
                'perempuan', perempuan
            )
        ), '[]'::JSONB) INTO v_demografi
        FROM public.t_demografi_pelkat
        WHERE id_pos = ANY(v_target_pos_ids);

        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_risiko', id_risiko,
                'kategori', kategori,
                'jenis_risiko', jenis_risiko,
                'frekuensi', frekuensi
            )
        ), '[]'::JSONB) INTO v_kerawanan
        FROM public.t_kerawanan_wilayah
        WHERE id_pos = ANY(v_target_pos_ids);

        SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_potensi', id_potensi,
                'nama_potensi', nama_potensi,
                'kategori', kategori,
                'deskripsi', deskripsi
            )
        ), '[]'::JSONB) INTO v_potensi
        FROM public.t_potensi_wilayah
        WHERE id_pos = ANY(v_target_pos_ids);
    END IF;

    -- 11. Construct Final Unified JSON Payload
    v_result := jsonb_build_object(
        'id_org', v_canonical_id,
        'identity', jsonb_build_object(
            'id_org', v_canonical_id,
            'org_level', v_org_level,
            'nama', v_name,
            'keterangan', v_keterangan,
            'status', v_status
        ),
        'structure', jsonb_build_object(
            'parent', CASE WHEN v_parent_id IS NOT NULL THEN jsonb_build_object('id_org', v_parent_id, 'nama', v_parent_name, 'org_level', v_parent_level) ELSE NULL END,
            'children', v_children,
            'ancestors', v_ancestors
        ),
        'context', jsonb_build_object(
            'requester_access_level', CASE WHEN v_can_see_private THEN 'FULL_ADMIN' WHEN v_can_see_public_ctx THEN 'READ_CONTEXT' ELSE 'PUBLIC_VISITOR' END,
            'is_same_ancestral_tree', v_is_same_tree
        ),
        'overview', jsonb_build_object(
            'alamat', v_alamat,
            'latitude', v_latitude,
            'longitude', v_longitude,
            'tgl_berdiri', v_tgl_berdiri,
            'kmj_nama', v_kmj_nama,
            'total_pos_count', v_total_pos_count,
            'total_pelayan_count', v_total_pelayan_count
        ),
        'people', jsonb_build_object(
            'kmj', CASE WHEN v_kmj_id_person IS NOT NULL THEN jsonb_build_object('id_person', v_kmj_id_person, 'nama_lengkap', v_kmj_nama, 'role_label', 'KMJ', 'status', 'Aktif') ELSE NULL END,
            'pj_list', v_pj_list,
            'pelayan_list', v_pelayan_list,
            'relawan_list', v_relawan_list
        ),
        'assets', jsonb_build_object(
            'total_count', v_assets_total,
            'total_tanah', v_assets_tanah,
            'total_bangunan', v_assets_bangunan,
            'total_bergerak', v_assets_bergerak,
            'items', v_asset_items
        ),
        'aid_requests', jsonb_build_object(
            'total_count', v_aid_total,
            'active_count', v_aid_active,
            'approved_count', v_aid_approved,
            'items', v_aid_items
        ),
        'territory', jsonb_build_object(
            'demografi', v_demografi,
            'kerawanan', v_kerawanan,
            'potensi', v_potensi
        ),
        '_meta', jsonb_build_object(
            'privacy', jsonb_build_object(
                'identity', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'structure', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
                'overview', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT'),
                'people', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT'),
                'assets', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'aid_requests', jsonb_build_object('accessible', v_can_see_restricted, 'visibility', 'RESTRICTED', 'reason', v_reason_restricted),
                'territory', jsonb_build_object('accessible', v_can_see_public_ctx, 'visibility', 'PUBLIC_WITHIN_CONTEXT')
            )
        )
    );

    RETURN v_result;
END;
$$;
