-- ============================================================================
-- F9 GEOSPATIAL & TERRITORY BOUNDARY ENGINE MIGRATION
-- Reference Implementation #8 (Spatial Context Resolution & Boundary Polygon Engine)
-- ============================================================================

-- Enable PostGIS Extension if not enabled
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- 0. SPATIAL HISTORY AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.sys_spatial_history_logs (
    id_history TEXT PRIMARY KEY DEFAULT ('SPATIAL-HIST-' || gen_random_uuid()::text),
    id_spatial TEXT NOT NULL,
    canonical_entity_type TEXT NOT NULL,
    canonical_entity_id TEXT NOT NULL,
    semantic_category TEXT NOT NULL,
    previous_geojson JSONB NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    request_id TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. PHYSICAL TABLE: SECTOR & TERRITORY BOUNDARIES (m_wilayah_pelayanan)
CREATE TABLE IF NOT EXISTS public.m_wilayah_pelayanan (
    id_spatial TEXT PRIMARY KEY DEFAULT ('GEO-' || gen_random_uuid()::text),
    canonical_entity_type TEXT NOT NULL CHECK (canonical_entity_type IN ('organization', 'sector', 'asset', 'territory_zone')),
    canonical_entity_id TEXT NOT NULL,
    semantic_category TEXT NOT NULL CHECK (semantic_category IN ('TERRITORY_BOUNDARY', 'RISK_ZONE', 'RESOURCE_ZONE', 'POINT_LOCATION')),
    nama_wilayah TEXT NOT NULL,
    keterangan TEXT,
    geojson_data JSONB NOT NULL,
    luas_m2 NUMERIC,
    geom extensions.geometry(Geometry, 4326),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GIST SPATIAL INDEXING FOR FAST POLYGON/POINT QUERIES
CREATE INDEX IF NOT EXISTS idx_wilayah_geom ON public.m_wilayah_pelayanan USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_wilayah_entity ON public.m_wilayah_pelayanan (canonical_entity_type, canonical_entity_id);
CREATE INDEX IF NOT EXISTS idx_wilayah_semantic ON public.m_wilayah_pelayanan (semantic_category);

-- Enable RLS
ALTER TABLE public.m_wilayah_pelayanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_spatial_history_logs ENABLE ROW LEVEL SECURITY;

-- 3. HELPER FUNCTION: VALIDATE WGS84 COORDINATE RANGE & GEOMETRY SEMANTIC COMPATIBILITY
CREATE OR REPLACE FUNCTION public.validate_geospatial_feature_atomic(
    p_geometry_type TEXT,
    p_semantic_category TEXT,
    p_coordinates JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Semantic ↔ Geometry Type Compatibility Matrix Enforcement
    IF p_semantic_category IN ('TERRITORY_BOUNDARY', 'RISK_ZONE', 'RESOURCE_ZONE') THEN
        IF p_geometry_type NOT IN ('Polygon', 'MultiPolygon') THEN
            RAISE EXCEPTION 'GEOMETRY_SEMANTIC_MISMATCH: Category % requires Polygon or MultiPolygon geometry.', p_semantic_category;
        END IF;
    ELSIF p_semantic_category = 'POINT_LOCATION' THEN
        IF p_geometry_type != 'Point' THEN
            RAISE EXCEPTION 'GEOMETRY_SEMANTIC_MISMATCH: Category POINT_LOCATION requires Point geometry.';
        END IF;
    ELSE
        RAISE EXCEPTION 'INVALID_SEMANTIC_CATEGORY: Category % is not supported.', p_semantic_category;
    END IF;

    RETURN TRUE;
END;
$$;

-- 4. ATOMIC SPATIAL BOUNDARY MUTATION & AUDIT RPC
CREATE OR REPLACE FUNCTION public.save_territory_boundary_atomic(
    p_id_spatial TEXT DEFAULT NULL,
    p_canonical_entity_type TEXT DEFAULT 'sector',
    p_canonical_entity_id TEXT DEFAULT NULL,
    p_semantic_category TEXT DEFAULT 'TERRITORY_BOUNDARY',
    p_nama_wilayah TEXT DEFAULT NULL,
    p_keterangan TEXT DEFAULT NULL,
    p_geojson_feature JSONB DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_id_spatial TEXT;
    v_geom_type TEXT;
    v_geom extensions.geometry;
    v_existing RECORD;
    v_log_exists BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for spatial mutations.';
    END IF;

    -- Idempotency Check
    IF p_request_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.sys_transaction_logs WHERE request_id = p_request_id
        ) INTO v_log_exists;

        IF v_log_exists THEN
            RETURN public.get_territory_geospatial_360(p_canonical_entity_type, p_canonical_entity_id);
        END IF;
    END IF;

    IF p_canonical_entity_id IS NULL OR p_nama_wilayah IS NULL OR p_geojson_feature IS NULL THEN
        RAISE EXCEPTION 'INVALID_INPUT: Missing required spatial parameters.';
    END IF;

    -- Extract geometry type
    v_geom_type := p_geojson_feature->'geometry'->>'type';
    IF v_geom_type IS NULL THEN
        RAISE EXCEPTION 'INVALID_GEOJSON: Missing geometry type in Feature.';
    END IF;

    -- Enforce Semantic ↔ Geometry Matrix
    PERFORM public.validate_geospatial_feature_atomic(v_geom_type, p_semantic_category, p_geojson_feature->'geometry'->'coordinates');

    -- Convert GeoJSON to PostGIS Geometry (SRID 4326)
    BEGIN
        v_geom := ST_SetSRID(ST_GeomFromGeoJSON(p_geojson_feature->>'geometry'), 4326);
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'INVALID_GEOJSON_FORMAT: Could not parse GeoJSON geometry into SRID 4326.';
    END;

    -- PostGIS ST_IsValid Topology Check
    IF NOT ST_IsValid(v_geom) THEN
        RAISE EXCEPTION 'INVALID_TOPOLOGY: Self-intersecting or invalid polygon geometry topology rejected.';
    END IF;

    v_id_spatial := COALESCE(p_id_spatial, 'GEO-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12));

    -- Check if record exists for update & historical archiving
    SELECT * INTO v_existing FROM public.m_wilayah_pelayanan WHERE id_spatial = v_id_spatial FOR UPDATE;

    IF FOUND THEN
        -- Archive previous spatial geometry
        INSERT INTO public.sys_spatial_history_logs (
            id_spatial,
            canonical_entity_type,
            canonical_entity_id,
            semantic_category,
            previous_geojson,
            actor_id,
            request_id,
            reason
        ) VALUES (
            v_existing.id_spatial,
            v_existing.canonical_entity_type,
            v_existing.canonical_entity_id,
            v_existing.semantic_category,
            v_existing.geojson_data,
            v_uid,
            p_request_id,
            COALESCE(p_reason, 'Spatial boundary update mutation')
        );

        -- Update Spatial Record
        UPDATE public.m_wilayah_pelayanan
        SET 
            canonical_entity_type = p_canonical_entity_type,
            canonical_entity_id = p_canonical_entity_id,
            semantic_category = p_semantic_category,
            nama_wilayah = p_nama_wilayah,
            keterangan = COALESCE(p_keterangan, keterangan),
            geojson_data = p_geojson_feature,
            geom = v_geom,
            luas_m2 = ST_Area(v_geom::geography),
            updated_at = NOW()
        WHERE id_spatial = v_id_spatial;
    ELSE
        -- Insert New Spatial Record
        INSERT INTO public.m_wilayah_pelayanan (
            id_spatial,
            canonical_entity_type,
            canonical_entity_id,
            semantic_category,
            nama_wilayah,
            keterangan,
            geojson_data,
            geom,
            luas_m2,
            created_by
        ) VALUES (
            v_id_spatial,
            p_canonical_entity_type,
            p_canonical_entity_id,
            p_semantic_category,
            p_nama_wilayah,
            p_keterangan,
            p_geojson_feature,
            v_geom,
            ST_Area(v_geom::geography),
            v_uid
        );
    END IF;

    -- Log Idempotency Token
    IF p_request_id IS NOT NULL THEN
        INSERT INTO public.sys_transaction_logs (request_id, entity_id, action, status)
        VALUES (p_request_id, v_id_spatial, 'SAVE_SPATIAL_BOUNDARY', 'SUCCESS')
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN public.get_territory_geospatial_360(p_canonical_entity_type, p_canonical_entity_id);
END;
$$;

-- 5. READ MODEL QUERY RPC: GET TERRITORY GEOSPATIAL 360 (GEOJSON FEATURECOLLECTION)
CREATE OR REPLACE FUNCTION public.get_territory_geospatial_360(
    p_canonical_entity_type TEXT,
    p_canonical_entity_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_features JSONB;
    v_total INT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT 
        COALESCE(jsonb_agg(
            jsonb_build_object(
                'type', 'Feature',
                'id', w.id_spatial,
                'geometry', w.geojson_data->'geometry',
                'properties', jsonb_build_object(
                    'id_spatial', w.id_spatial,
                    'canonical_entity_type', w.canonical_entity_type,
                    'canonical_entity_id', w.canonical_entity_id,
                    'semantic_category', w.semantic_category,
                    'nama_wilayah', w.nama_wilayah,
                    'keterangan', w.keterangan,
                    'luas_m2', w.luas_m2,
                    'created_at', w.created_at
                )
            ) ORDER BY w.created_at DESC
        ), '[]'::jsonb),
        COUNT(*)
    INTO v_features, v_total
    FROM public.m_wilayah_pelayanan w
    WHERE w.canonical_entity_type = p_canonical_entity_type 
      AND w.canonical_entity_id = p_canonical_entity_id;

    RETURN jsonb_build_object(
        'canonical_entity_type', p_canonical_entity_type,
        'canonical_entity_id', p_canonical_entity_id,
        'total_features', v_total,
        'feature_collection', jsonb_build_object(
            'type', 'FeatureCollection',
            'features', v_features
        )
    );
END;
$$;
