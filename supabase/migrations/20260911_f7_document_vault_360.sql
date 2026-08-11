-- ============================================================================
-- F7 DOCUMENT VAULT & STORAGE OBJECT MIGRATION
-- Reference Implementation #6 (Document Storage Lifecycle & Security Boundary)
-- ============================================================================

-- 1. PHYSICAL METADATA TABLE
CREATE TABLE IF NOT EXISTS public.t_dokumen_resmi (
    id_dokumen TEXT PRIMARY KEY DEFAULT ('DOC-' || gen_random_uuid()::text),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'organization', 'asset', 'aid_request')),
    entity_id TEXT NOT NULL,
    nama_file TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
    mime_type TEXT NOT NULL,
    visibility_tier TEXT NOT NULL DEFAULT 'ORG_WIDE' CHECK (visibility_tier IN ('PUBLIC', 'ORG_WIDE', 'CONFIDENTIAL')),
    sha256_checksum TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING_UPLOAD' CHECK (status IN ('PENDING_UPLOAD', 'ACTIVE', 'FAILED_UPLOAD', 'CORRUPTED', 'DELETED')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_dokumen_entity ON public.t_dokumen_resmi (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_dokumen_status ON public.t_dokumen_resmi (status);

-- Enable RLS on metadata table
ALTER TABLE public.t_dokumen_resmi ENABLE ROW LEVEL SECURITY;

-- 2. PRIVATE STORAGE BUCKET CREATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault_documents', 'vault_documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. RPC: REGISTER DOCUMENT UPLOAD INTENT (PHASE 1)
CREATE OR REPLACE FUNCTION public.register_document_upload_intent(
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_nama_file TEXT,
    p_size_bytes BIGINT,
    p_mime_type TEXT,
    p_visibility_tier TEXT DEFAULT 'ORG_WIDE'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_id_dokumen TEXT;
    v_storage_path TEXT;
    v_result JSONB;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required to upload documents.';
    END IF;

    -- Validate input parameters
    IF p_entity_type NOT IN ('person', 'organization', 'asset', 'aid_request') THEN
        RAISE EXCEPTION 'INVALID_ENTITY: Invalid entity_type specified.';
    END IF;

    v_id_dokumen := 'DOC-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);
    v_storage_path := p_entity_type || '/' || p_entity_id || '/' || v_id_dokumen || '/' || p_nama_file;

    INSERT INTO public.t_dokumen_resmi (
        id_dokumen,
        entity_type,
        entity_id,
        nama_file,
        storage_path,
        size_bytes,
        mime_type,
        visibility_tier,
        status,
        created_by
    ) VALUES (
        v_id_dokumen,
        p_entity_type,
        p_entity_id,
        p_nama_file,
        v_storage_path,
        p_size_bytes,
        p_mime_type,
        COALESCE(p_visibility_tier, 'ORG_WIDE'),
        'PENDING_UPLOAD',
        v_uid
    );

    v_result := jsonb_build_object(
        'id_dokumen', v_id_dokumen,
        'entity_type', p_entity_type,
        'entity_id', p_entity_id,
        'expected_file_name', p_nama_file,
        'expected_size_bytes', p_size_bytes,
        'expected_mime_type', p_mime_type,
        'storage_path', v_storage_path,
        'upload_token', 'TOKEN-' || v_id_dokumen,
        'expires_at', (NOW() + INTERVAL '1 hour')::text
    );

    RETURN v_result;
END;
$$;

-- 4. RPC: CONFIRM DOCUMENT UPLOAD SUCCESS (PHASE 2)
CREATE OR REPLACE FUNCTION public.confirm_document_upload_success(
    p_id_dokumen TEXT,
    p_sha256_checksum TEXT DEFAULT NULL,
    p_size_bytes BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_doc RECORD;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_doc FROM public.t_dokumen_resmi WHERE id_dokumen = p_id_dokumen FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'DOCUMENT_NOT_FOUND: Specified document id does not exist.';
    END IF;

    IF v_doc.status != 'PENDING_UPLOAD' THEN
        RAISE EXCEPTION 'INVALID_TRANSITION: Document is not in PENDING_UPLOAD state.';
    END IF;

    -- Double verification: declare vs confirmation mismatch check
    IF p_size_bytes IS NOT NULL AND p_size_bytes != v_doc.size_bytes THEN
        UPDATE public.t_dokumen_resmi 
        SET status = 'CORRUPTED', updated_at = NOW() 
        WHERE id_dokumen = p_id_dokumen;
        
        RAISE EXCEPTION 'FILE_SIZE_MISMATCH: Uploaded file size does not match declared intent.';
    END IF;

    UPDATE public.t_dokumen_resmi
    SET 
        status = 'ACTIVE',
        sha256_checksum = COALESCE(p_sha256_checksum, v_doc.sha256_checksum),
        updated_at = NOW()
    WHERE id_dokumen = p_id_dokumen;

    RETURN jsonb_build_object(
        'id_dokumen', p_id_dokumen,
        'status', 'ACTIVE',
        'storage_path', v_doc.storage_path
    );
END;
$$;

-- 5. RPC: GET DOCUMENT SIGNED URL METADATA
CREATE OR REPLACE FUNCTION public.get_document_signed_url(
    p_id_dokumen TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_doc RECORD;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_doc FROM public.t_dokumen_resmi WHERE id_dokumen = p_id_dokumen;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'DOCUMENT_NOT_FOUND: Specified document does not exist.';
    END IF;

    IF v_doc.status = 'DELETED' OR v_doc.status = 'PENDING_UPLOAD' THEN
        RAISE EXCEPTION 'UNAVAILABLE_DOCUMENT: Cannot generate signed URL for inactive or deleted document.';
    END IF;

    RETURN jsonb_build_object(
        'id_dokumen', v_doc.id_dokumen,
        'storage_path', v_doc.storage_path,
        'signed_url', 'https://mock-storage.supabase.co/object/sign/vault_documents/' || v_doc.storage_path || '?token=MOCK_SIGNED_TOKEN',
        'expires_at', (NOW() + INTERVAL '60 seconds')::text
    );
END;
$$;

-- 6. RPC: DELETE DOCUMENT SOFT
CREATE OR REPLACE FUNCTION public.delete_document_soft(
    p_id_dokumen TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_doc RECORD;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_doc FROM public.t_dokumen_resmi WHERE id_dokumen = p_id_dokumen FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'DOCUMENT_NOT_FOUND: Specified document does not exist.';
    END IF;

    UPDATE public.t_dokumen_resmi
    SET status = 'DELETED', updated_at = NOW()
    WHERE id_dokumen = p_id_dokumen;

    RETURN jsonb_build_object(
        'id_dokumen', p_id_dokumen,
        'status', 'DELETED',
        'storage_path', v_doc.storage_path
    );
END;
$$;

-- 7. RPC: GET DOCUMENT VAULT 360 (READ MODEL)
CREATE OR REPLACE FUNCTION public.get_document_vault_360(
    p_entity_type TEXT,
    p_entity_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_docs JSONB;
    v_total_count INT;
    v_total_size BIGINT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT 
        COALESCE(jsonb_agg(
            jsonb_build_object(
                'id_dokumen', d.id_dokumen,
                'entity_type', d.entity_type,
                'entity_id', d.entity_id,
                'nama_file', d.nama_file,
                'storage_path', d.storage_path,
                'size_bytes', d.size_bytes,
                'mime_type', d.mime_type,
                'visibility_tier', d.visibility_tier,
                'sha256_checksum', d.sha256_checksum,
                'status', d.status,
                'created_at', d.created_at
            ) ORDER BY d.created_at DESC
        ), '[]'::jsonb),
        COUNT(*),
        COALESCE(SUM(d.size_bytes), 0)
    INTO v_docs, v_total_count, v_total_size
    FROM public.t_dokumen_resmi d
    WHERE d.entity_type = p_entity_type 
      AND d.entity_id = p_entity_id
      AND d.status != 'DELETED';

    RETURN jsonb_build_object(
        'entity_type', p_entity_type,
        'entity_id', p_entity_id,
        'total_count', v_total_count,
        'total_size_bytes', v_total_size,
        'documents', v_docs
    );
END;
$$;
