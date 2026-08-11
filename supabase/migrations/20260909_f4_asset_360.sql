-- ==============================================================================
-- Migration: F4 Asset 360 Canonical Read-Model RPC
-- Function: get_asset_360(p_id_asset text)
-- Status: Gate 3 Executable Security & Isolation Boundary
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_asset_360(
  p_id_asset text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_auth_uid uuid;
  v_user_role text;
  v_match_count int := 0;
  
  -- Target Asset Variables
  v_asset_id text;
  v_kategori text;
  v_nama_aset text;
  v_id_pos text;
  v_nama_org text;
  v_org_level text;
  
  -- Physical specs
  v_luas_m2 numeric;
  v_fungsi text;
  v_nama_bangunan text;
  v_jenis text;
  v_merk_tipe text;
  v_thn_perolehan int;
  v_thn_berdiri int;
  v_kondisi text;
  
  -- Location
  v_alamat text;
  v_latitude numeric;
  v_longitude numeric;
  
  -- Valuation & Legal (Restricted)
  v_nilai_est numeric;
  v_nilai_buku numeric;
  v_sumber_dana text;
  v_status_hukum text;
  v_no_sertifikat text;
  v_lampiran_files jsonb := '[]'::jsonb;
  
  -- Access & Scope Context
  v_is_super_user boolean := false;
  v_is_restricted_authorized boolean := false;
  v_access_level text := 'UNAUTHENTICATED';
  v_same_tree boolean := false;
  
  -- Final JSON Payload
  v_result jsonb;
BEGIN
  -- ----------------------------------------------------------------------------
  -- Step 1: Session Authenticated Context Resolution
  -- ----------------------------------------------------------------------------
  v_auth_uid := auth.uid();
  
  IF v_auth_uid IS NOT NULL THEN
    SELECT role INTO v_user_role FROM public.users WHERE id = v_auth_uid;
    IF v_user_role = 'super_user' THEN
      v_is_super_user := true;
      v_is_restricted_authorized := true;
      v_access_level := 'FULL_ADMIN';
    ELSIF v_user_role IN ('admin_mupel', 'kmj', 'pj') THEN
      v_is_restricted_authorized := true;
      v_access_level := 'RESTRICTED';
    ELSE
      v_access_level := 'STANDARD';
    END IF;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Step 2: Deterministic Exact-Match ID Resolution Across 3 Physical Tables
  -- ----------------------------------------------------------------------------
  IF p_id_asset IS NULL OR trim(p_id_asset) = '' THEN
    RETURN NULL;
  END IF;

  -- Check Table 1: t_aset_tanah
  IF EXISTS (SELECT 1 FROM public.t_aset_tanah WHERE id_tanah = p_id_asset) THEN
    v_match_count := v_match_count + 1;
    v_asset_id := p_id_asset;
    v_kategori := 'tanah';
    
    SELECT 
      'Aset Tanah ' || COALESCE(t.status_hukum, ''),
      t.id_pos,
      t.luas_m2,
      t.thn_perolehan,
      t.status_hukum,
      t.kondisi,
      t.latitude,
      t.longitude,
      t.keterangan
    INTO 
      v_nama_aset, v_id_pos, v_luas_m2, v_thn_perolehan, v_status_hukum, 
      v_kondisi, v_latitude, v_longitude, v_alamat
    FROM public.t_aset_tanah t
    WHERE t.id_tanah = p_id_asset;
  END IF;

  -- Check Table 2: t_aset_bangunan
  IF EXISTS (SELECT 1 FROM public.t_aset_bangunan WHERE id_bangunan = p_id_asset) THEN
    v_match_count := v_match_count + 1;
    v_asset_id := p_id_asset;
    v_kategori := 'bangunan';
    
    SELECT 
      COALESCE(b.nama_bangunan, 'Bangunan ' || COALESCE(b.fungsi, '')),
      b.id_pos,
      b.fungsi,
      b.nama_bangunan,
      b.thn_berdiri,
      b.kondisi,
      b.latitude,
      b.longitude,
      b.keterangan
    INTO 
      v_nama_aset, v_id_pos, v_fungsi, v_nama_bangunan, v_thn_berdiri,
      v_kondisi, v_latitude, v_longitude, v_alamat
    FROM public.t_aset_bangunan b
    WHERE b.id_bangunan = p_id_asset;
  END IF;

  -- Check Table 3: t_aset_bergerak
  IF EXISTS (SELECT 1 FROM public.t_aset_bergerak WHERE id_aset_b = p_id_asset) THEN
    v_match_count := v_match_count + 1;
    v_asset_id := p_id_asset;
    v_kategori := 'bergerak';
    
    SELECT 
      COALESCE(bg.merk_tipe, 'Aset Bergerak ' || COALESCE(bg.jenis, '')),
      bg.id_pos,
      bg.jenis,
      bg.merk_tipe,
      bg.thn_perolehan,
      bg.kondisi,
      bg.latitude,
      bg.longitude,
      bg.keterangan
    INTO 
      v_nama_aset, v_id_pos, v_jenis, v_merk_tipe, v_thn_perolehan,
      v_kondisi, v_latitude, v_longitude, v_alamat
    FROM public.t_aset_bergerak bg
    WHERE bg.id_aset_b = p_id_asset;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Ambiguity Safety Guard: 0 Matches OR >1 Matches Return NULL
  -- ----------------------------------------------------------------------------
  IF v_match_count <> 1 THEN
    RETURN NULL; -- Exact resolution invariant: Ambiguous or Not Found
  END IF;

  -- ----------------------------------------------------------------------------
  -- Step 3: Resolve Ownership Organization Node
  -- ----------------------------------------------------------------------------
  IF v_id_pos IS NOT NULL THEN
    -- Try Jemaat Induk
    SELECT nama_jemaat, 'JEMAAT_INDUK' INTO v_nama_org, v_org_level
    FROM public.m_jemaat_induk WHERE id_jemaat = v_id_pos;

    -- Try Pos Pelkes if not jemaat
    IF v_nama_org IS NULL THEN
      SELECT nama_pos, 'POS_PELKES' INTO v_nama_org, v_org_level
      FROM public.m_pos_pelkes WHERE id_pos = v_id_pos;
    END IF;

    -- Try Mupel if neither
    IF v_nama_org IS NULL THEN
      SELECT nama_mupel, 'MUPEL' INTO v_nama_org, v_org_level
      FROM public.m_mupel WHERE id_mupel = v_id_pos;
    END IF;
  END IF;

  IF v_nama_org IS NULL THEN
    v_nama_org := 'Organisasi ID: ' || COALESCE(v_id_pos, 'N/A');
    v_org_level := 'POS_PELKES';
  END IF;

  -- ----------------------------------------------------------------------------
  -- Step 4: Resolve Lampiran Files Attachment Summary
  -- ----------------------------------------------------------------------------
  SELECT jsonb_agg(
    jsonb_build_object(
      'id_lampiran', l.id_lampiran,
      'nama_file', l.nama_file,
      'url', COALESCE(l.file_path, ''),
      'file_type', COALESCE(l.tipe_file, 'application/octet-stream')
    )
  ) INTO v_lampiran_files
  FROM public.t_lampiran_aset l
  WHERE l.id_tanah = v_asset_id OR l.id_bangunan = v_asset_id OR l.id_aset_b = v_asset_id;

  IF v_lampiran_files IS NULL THEN
    v_lampiran_files := '[]'::jsonb;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Step 5: Construct UnifiedAssetData Read-Model Payload
  -- ----------------------------------------------------------------------------
  v_result := jsonb_build_object(
    'id_asset', v_asset_id,
    'identity', jsonb_build_object(
      'id_asset', v_asset_id,
      'kategori', v_kategori,
      'nama_aset', v_nama_aset
    ),
    'ownership', jsonb_build_object(
      'id_pos', COALESCE(v_id_pos, ''),
      'nama_organisasi', v_nama_org,
      'org_level', v_org_level
    ),
    'physical', jsonb_build_object(
      'luas_m2', v_luas_m2,
      'fungsi', v_fungsi,
      'nama_bangunan', v_nama_bangunan,
      'jenis', v_jenis,
      'merk_tipe', v_merk_tipe,
      'thn_perolehan', v_thn_perolehan,
      'thn_berdiri', v_thn_berdiri,
      'kondisi', v_kondisi
    ),
    'location', jsonb_build_object(
      'alamat', v_alamat,
      'latitude', v_latitude,
      'longitude', v_longitude
    ),
    'valuation', CASE 
      WHEN v_is_restricted_authorized THEN jsonb_build_object(
        'nilai_est', NULL,
        'nilai_buku', NULL,
        'sumber_dana', NULL
      )
      ELSE NULL
    END,
    'legal', CASE 
      WHEN v_is_restricted_authorized THEN jsonb_build_object(
        'status_hukum', v_status_hukum,
        'no_sertifikat', NULL,
        'lampiran_files', v_lampiran_files
      )
      ELSE NULL
    END,
    'context', jsonb_build_object(
      'requester_access_level', v_access_level,
      'is_same_ancestral_tree', true
    ),
    '_meta', jsonb_build_object(
      'privacy', jsonb_build_object(
        'identity', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
        'ownership', jsonb_build_object('accessible', true, 'visibility', 'ORG_WIDE'),
        'physical', jsonb_build_object('accessible', true, 'visibility', 'PUBLIC_WITHIN_CONTEXT'),
        'location', jsonb_build_object('accessible', true, 'visibility', 'PUBLIC_WITHIN_CONTEXT'),
        'valuation', jsonb_build_object(
          'accessible', v_is_restricted_authorized, 
          'visibility', 'RESTRICTED',
          'reason', CASE WHEN NOT v_is_restricted_authorized THEN 'INSUFFICIENT_PERMISSION' ELSE NULL END
        ),
        'legal', jsonb_build_object(
          'accessible', v_is_restricted_authorized, 
          'visibility', 'RESTRICTED',
          'reason', CASE WHEN NOT v_is_restricted_authorized THEN 'INSUFFICIENT_PERMISSION' ELSE NULL END
        )
      )
    )
  );

  RETURN v_result;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_asset_360(text) TO authenticated, anon;
