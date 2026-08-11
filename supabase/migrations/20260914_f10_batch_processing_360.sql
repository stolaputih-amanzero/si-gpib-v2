-- ============================================================================
-- F10 BULK BATCH MUTATION & STAGING ENGINE MIGRATION
-- Reference Implementation #9 (Mass Import, Dry-Run Staging, & Chunked Execution Engine)
-- ============================================================================

-- 1. BATCH HEADER TABLE
CREATE TABLE IF NOT EXISTS public.sys_batch_header (
    id_batch TEXT PRIMARY KEY DEFAULT ('BATCH-' || gen_random_uuid()::text),
    target_entity_type TEXT NOT NULL,
    atomicity_policy TEXT NOT NULL CHECK (atomicity_policy IN ('ALL_OR_NOTHING', 'PARTIAL_ALLOW_VALID')),
    lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('UPLOADED', 'VALIDATING', 'VALIDATED', 'EXECUTING', 'COMPLETED', 'FAILED', 'RECONCILED')),
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    invalid_rows INT NOT NULL DEFAULT 0,
    committed_rows INT NOT NULL DEFAULT 0,
    failed_rows INT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2. BATCH STAGING ROW TABLE
CREATE TABLE IF NOT EXISTS public.sys_batch_staging (
    id_staging TEXT PRIMARY KEY DEFAULT ('STG-' || gen_random_uuid()::text),
    batch_id TEXT NOT NULL REFERENCES public.sys_batch_header(id_batch) ON DELETE CASCADE,
    row_number INT NOT NULL,
    row_status TEXT NOT NULL CHECK (row_status IN ('STAGED', 'VALID', 'INVALID', 'PROCESSING', 'COMMITTED', 'FAILED')),
    payload JSONB NOT NULL,
    error_code TEXT,
    error_message TEXT,
    reconciliation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Fast Querying & Processing
CREATE INDEX IF NOT EXISTS idx_batch_staging_batch_status ON public.sys_batch_staging (batch_id, row_status);
CREATE INDEX IF NOT EXISTS idx_batch_staging_row_num ON public.sys_batch_staging (batch_id, row_number);
CREATE INDEX IF NOT EXISTS idx_batch_header_actor ON public.sys_batch_header (created_by, lifecycle_status);

-- Enable RLS
ALTER TABLE public.sys_batch_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_batch_staging ENABLE ROW LEVEL SECURITY;

-- 3. RPC: CREATE BATCH STAGING RECORD
CREATE OR REPLACE FUNCTION public.create_batch_staging_atomic(
    p_target_entity_type TEXT,
    p_atomicity_policy TEXT,
    p_raw_payload_array JSONB,
    p_request_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_batch_id TEXT;
    v_row JSONB;
    v_idx INT := 0;
    v_total INT;
    v_log_exists BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for batch creation.';
    END IF;

    -- Idempotency Check
    IF p_request_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.sys_transaction_logs WHERE request_id = p_request_id
        ) INTO v_log_exists;

        IF v_log_exists THEN
            SELECT id_batch INTO v_batch_id FROM public.sys_batch_header WHERE created_by = v_uid ORDER BY created_at DESC LIMIT 1;
            RETURN public.get_batch_processing_360(v_batch_id);
        END IF;
    END IF;

    v_total := jsonb_array_length(p_raw_payload_array);
    v_batch_id := 'BATCH-' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);

    -- Create Header Record
    INSERT INTO public.sys_batch_header (
        id_batch,
        target_entity_type,
        atomicity_policy,
        lifecycle_status,
        total_rows,
        created_by
    ) VALUES (
        v_batch_id,
        p_target_entity_type,
        p_atomicity_policy,
        'UPLOADED',
        v_total,
        v_uid
    );

    -- Insert Staging Rows
    FOR v_row IN SELECT * FROM jsonb_array_elements(p_raw_payload_array) LOOP
        v_idx := v_idx + 1;
        INSERT INTO public.sys_batch_staging (
            batch_id,
            row_number,
            row_status,
            payload
        ) VALUES (
            v_batch_id,
            v_idx,
            'STAGED',
            v_row
        );
    END LOOP;

    -- Log Idempotency Token
    IF p_request_id IS NOT NULL THEN
        INSERT INTO public.sys_transaction_logs (request_id, entity_id, action, status)
        VALUES (p_request_id, v_batch_id, 'CREATE_BATCH_STAGING', 'SUCCESS')
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN public.get_batch_processing_360(v_batch_id);
END;
$$;

-- 4. RPC: VALIDATE BATCH STAGING DRY-RUN
CREATE OR REPLACE FUNCTION public.validate_batch_staging_dry_run(
    p_batch_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_batch RECORD;
    v_row RECORD;
    v_valid_count INT := 0;
    v_invalid_count INT := 0;
    v_is_valid BOOLEAN;
    v_err_code TEXT;
    v_err_msg TEXT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_batch FROM public.sys_batch_header WHERE id_batch = p_batch_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND: Batch % does not exist.', p_batch_id;
    END IF;

    UPDATE public.sys_batch_header SET lifecycle_status = 'VALIDATING' WHERE id_batch = p_batch_id;

    -- Evaluate each row deterministically without domain table mutation
    FOR v_row IN SELECT * FROM public.sys_batch_staging WHERE batch_id = p_batch_id ORDER BY row_number ASC FOR UPDATE LOOP
        v_is_valid := TRUE;
        v_err_code := NULL;
        v_err_msg := NULL;

        -- Example Domain Rule Check for Person entity
        IF v_batch.target_entity_type = 'person' THEN
            IF (v_row.payload->>'nama_lengkap') IS NULL OR trim(v_row.payload->>'nama_lengkap') = '' THEN
                v_is_valid := FALSE;
                v_err_code := 'MISSING_REQUIRED_FIELD';
                v_err_msg := 'Field nama_lengkap wajib diisi.';
            END IF;
        END IF;

        IF v_is_valid THEN
            v_valid_count := v_valid_count + 1;
            UPDATE public.sys_batch_staging 
            SET row_status = 'VALID', error_code = NULL, error_message = NULL, reconciliation_notes = NULL
            WHERE id_staging = v_row.id_staging;
        ELSE
            v_invalid_count := v_invalid_count + 1;
            UPDATE public.sys_batch_staging 
            SET row_status = 'INVALID', error_code = v_err_code, error_message = v_err_msg, reconciliation_notes = 'Perbaiki data di staging'
            WHERE id_staging = v_row.id_staging;
        END IF;
    END LOOP;

    -- Update Header Summary
    UPDATE public.sys_batch_header 
    SET 
        lifecycle_status = 'VALIDATED',
        valid_rows = v_valid_count,
        invalid_rows = v_invalid_count
    WHERE id_batch = p_batch_id;

    RETURN public.get_batch_processing_360(p_batch_id);
END;
$$;

-- 5. RPC: EXECUTE BATCH STAGING CHUNK
CREATE OR REPLACE FUNCTION public.execute_batch_staging_chunk(
    p_batch_id TEXT,
    p_chunk_size INT DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_batch RECORD;
    v_row RECORD;
    v_processed INT := 0;
    v_committed INT := 0;
    v_failed INT := 0;
    v_total_remaining INT;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for batch execution.';
    END IF;

    SELECT * INTO v_batch FROM public.sys_batch_header WHERE id_batch = p_batch_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND: Batch % does not exist.', p_batch_id;
    END IF;

    -- ALL_OR_NOTHING Enforcement: If invalid rows exist, abort entire execution
    IF v_batch.atomicity_policy = 'ALL_OR_NOTHING' AND v_batch.invalid_rows > 0 THEN
        RAISE EXCEPTION 'ATOMICITY_POLICY_VIOLATION: Batch % contains % invalid rows and policy is ALL_OR_NOTHING.', p_batch_id, v_batch.invalid_rows;
    END IF;

    UPDATE public.sys_batch_header SET lifecycle_status = 'EXECUTING' WHERE id_batch = p_batch_id;

    -- Fetch eligible rows (VALID or FAILED state for retry) up to chunk_size
    FOR v_row IN 
        SELECT * FROM public.sys_batch_staging 
        WHERE batch_id = p_batch_id AND row_status IN ('VALID', 'FAILED') 
        ORDER BY row_number ASC 
        LIMIT p_chunk_size 
        FOR UPDATE 
    LOOP
        v_processed := v_processed + 1;

        -- Set status to PROCESSING during execution pass
        UPDATE public.sys_batch_staging SET row_status = 'PROCESSING' WHERE id_staging = v_row.id_staging;

        -- Invoke certified domain logic / simulate domain commit
        BEGIN
            -- Domain Mutation Invariant Enforcement
            IF v_batch.target_entity_type = 'person' AND (v_row.payload->>'nama_lengkap') = 'FAIL_TRIGGER' THEN
                RAISE EXCEPTION 'DOMAIN_MUTATION_FAILED: Simulated domain invariant failure.';
            END IF;

            -- Successful Domain Commit
            v_committed := v_committed + 1;
            UPDATE public.sys_batch_staging 
            SET row_status = 'COMMITTED', error_code = NULL, error_message = NULL
            WHERE id_staging = v_row.id_staging;
        EXCEPTION WHEN OTHERS THEN
            v_failed := v_failed + 1;
            UPDATE public.sys_batch_staging 
            SET row_status = 'FAILED', error_code = 'EXECUTION_ERROR', error_message = SQLERRM, reconciliation_notes = 'Gagal dieksekusi ke domain table'
            WHERE id_staging = v_row.id_staging;
        END;

        -- Update Header Counters
        UPDATE public.sys_batch_header 
        SET 
            committed_rows = committed_rows + v_committed,
            failed_rows = failed_rows + v_failed
        WHERE id_batch = p_batch_id;
    END LOOP;

    -- Check if remaining valid/failed rows exist
    SELECT COUNT(*) INTO v_total_remaining 
    FROM public.sys_batch_staging 
    WHERE batch_id = p_batch_id AND row_status IN ('VALID', 'FAILED');

    IF v_total_remaining = 0 THEN
        UPDATE public.sys_batch_header 
        SET lifecycle_status = 'COMPLETED', completed_at = NOW() 
        WHERE id_batch = p_batch_id;
    END IF;

    RETURN public.get_batch_processing_360(p_batch_id);
END;
$$;

-- 6. RPC: GET BATCH PROCESSING 360 READ MODEL
CREATE OR REPLACE FUNCTION public.get_batch_processing_360(
    p_batch_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_uid UUID;
    v_header RECORD;
    v_rows JSONB;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_header FROM public.sys_batch_header WHERE id_batch = p_batch_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BATCH_NOT_FOUND: Batch % does not exist.', p_batch_id;
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_staging', s.id_staging,
            'batch_id', s.batch_id,
            'row_number', s.row_number,
            'row_status', s.row_status,
            'payload', s.payload,
            'error_code', s.error_code,
            'error_message', s.error_message,
            'reconciliation_notes', s.reconciliation_notes,
            'created_at', s.created_at
        ) ORDER BY s.row_number ASC
    ), '[]'::jsonb) INTO v_rows
    FROM public.sys_batch_staging s
    WHERE s.batch_id = p_batch_id;

    RETURN jsonb_build_object(
        'header', jsonb_build_object(
            'id_batch', v_header.id_batch,
            'target_entity_type', v_header.target_entity_type,
            'atomicity_policy', v_header.atomicity_policy,
            'lifecycle_status', v_header.lifecycle_status,
            'total_rows', v_header.total_rows,
            'valid_rows', v_header.valid_rows,
            'invalid_rows', v_header.invalid_rows,
            'committed_rows', v_header.committed_rows,
            'failed_rows', v_header.failed_rows,
            'created_at', v_header.created_at,
            'completed_at', v_header.completed_at
        ),
        'staging_rows', v_rows,
        'chunk_config', jsonb_build_object(
            'chunkSize', 100,
            'continueOnError', (v_header.atomicity_policy = 'PARTIAL_ALLOW_VALID')
        ),
        'validation_summary', jsonb_build_object(
            'batch_id', v_header.id_batch,
            'total_evaluated', v_header.total_rows,
            'valid_count', v_header.valid_rows,
            'invalid_count', v_header.invalid_rows,
            'can_execute', (v_header.invalid_rows = 0 OR v_header.atomicity_policy = 'PARTIAL_ALLOW_VALID')
        )
    );
END;
$$;
