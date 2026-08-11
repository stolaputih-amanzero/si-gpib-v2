-- ====================================================================================
-- FINAL PRODUCTION MIGRATION SCRIPT
-- ====================================================================================
-- INSTRUCTIONS FOR SUPABASE SQL EDITOR:
-- 1. DO NOT HIGHLIGHT or SELECT specific parts of this code.
-- 2. Make sure NO TEXT is highlighted in the editor.
-- 3. Click the "Run" button to execute the ENTIRE script in one go.
--
-- Why? This script uses temporary tables and transactions that must be run together 
-- in a single session.
-- ====================================================================================

BEGIN;

-- MANDATORY 1 FIX: Advisory lock at the very beginning to prevent concurrent migration DDL interference
SELECT pg_advisory_xact_lock(hashtext('SI_GPIB:B1:UNIVERSAL_IDENTITY'));

-- PREFLIGHT STAGE: Validation of existing schemas
DO $$
DECLARE
    v_fk_count INT;
    v_dup_count INT;
BEGIN
    -- Schema Preflight Assertions scoped to 'public' with complete source column checks
    -- m_pendeta complete check
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'nama_lengkap') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.nama_lengkap missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'no_wa') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.no_wa missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'tgl_lahir') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.tgl_lahir missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'gender') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.gender missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'status') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.status missing'; END IF;

    -- t_pelayan complete check
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'nama') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.nama missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'no_wa') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.no_wa missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'tgl_lahir') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.tgl_lahir missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'gender') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.gender missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'status') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.status missing'; END IF;

    -- t_relawan complete check
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'nama') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.nama missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'no_wa') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.no_wa missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'tgl_lahir') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.tgl_lahir missing'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'gender') THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.gender missing'; END IF;

    -- BLOCKER B1-08 FIX: Explicit partial-schema rejection
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'm_person') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'id_person')
        OR EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'id_person')
        OR EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'id_person')
        OR EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_person') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: legacy id_person column exists while public.m_person does not exist. Manual schema reconciliation required before B1 execution.';
        END IF;
    END IF;

    -- Existing m_person Structural Compatibility Contract validation
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'm_person') THEN
        -- id_person: UUID
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.id_person missing or not UUID';
        END IF;
        -- id_person: Single-Column Primary Key validation via pg_constraint
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = t.oid
            WHERE c.contype = 'p' 
              AND n.nspname = 'public' 
              AND t.relname = 'm_person' 
              AND a.attname = 'id_person'
              AND array_length(c.conkey, 1) = 1
              AND c.conkey[1] = a.attnum
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.id_person is not a valid single-column PRIMARY KEY';
        END IF;
        -- nama_lengkap: VARCHAR(>=150) / TEXT and NOT NULL
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'nama_lengkap' 
              AND (data_type = 'text' OR (data_type = 'character varying' AND character_maximum_length >= 150))
              AND is_nullable = 'NO'
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.nama_lengkap missing, not text/varchar(>=150), or is nullable';
        END IF;
        -- no_wa: VARCHAR(>=20) / TEXT
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'no_wa' 
              AND (data_type = 'text' OR (data_type = 'character varying' AND character_maximum_length >= 20))
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.no_wa missing or not text/varchar(>=20)';
        END IF;
        -- tgl_lahir: DATE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'tgl_lahir' AND data_type = 'date') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.tgl_lahir missing or not date';
        END IF;
        -- gender: VARCHAR(>=10) / TEXT
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'gender' 
              AND (data_type = 'text' OR (data_type = 'character varying' AND character_maximum_length >= 10))
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.gender missing or not text/varchar(>=10)';
        END IF;
        -- status_aktif: VARCHAR(>=50) / TEXT
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'm_person' AND column_name = 'status_aktif' 
              AND (data_type = 'text' OR (data_type = 'character varying' AND character_maximum_length >= 50))
        ) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_person.status_aktif missing or not text/varchar(>=50)';
        END IF;
    END IF;

    -- Existing id_person contract in legacy tables (UUID + FK validation via pg_constraint hardening)
    -- m_pendeta
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'id_person') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.id_person exists but is not UUID';
        END IF;
        
        SELECT COUNT(*) INTO v_fk_count 
        FROM pg_constraint c
        JOIN pg_class conrel ON c.conrelid = conrel.oid
        JOIN pg_namespace connsp ON conrel.relnamespace = connsp.oid
        JOIN pg_class confrel ON c.confrelid = confrel.oid
        JOIN pg_namespace confnsp ON confrel.relnamespace = confnsp.oid
        JOIN pg_attribute conatt ON conatt.attrelid = conrel.oid AND conatt.attnum = ANY(c.conkey)
        JOIN pg_attribute confatt ON confatt.attrelid = confrel.oid AND confatt.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.convalidated = true
          AND connsp.nspname = 'public' AND conrel.relname = 'm_pendeta' AND conatt.attname = 'id_person'
          AND confnsp.nspname = 'public' AND confrel.relname = 'm_person' AND confatt.attname = 'id_person'
          AND array_length(c.conkey, 1) = 1 AND array_length(c.confkey, 1) = 1
          AND c.conkey[1] = conatt.attnum AND c.confkey[1] = confatt.attnum;
          
        IF v_fk_count = 0 THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.m_pendeta.id_person exists but has no valid, single-column, validated FK to public.m_person(id_person)'; END IF;
    END IF;

    -- t_pelayan
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'id_person') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.id_person exists but is not UUID';
        END IF;
        
        SELECT COUNT(*) INTO v_fk_count 
        FROM pg_constraint c
        JOIN pg_class conrel ON c.conrelid = conrel.oid
        JOIN pg_namespace connsp ON conrel.relnamespace = connsp.oid
        JOIN pg_class confrel ON c.confrelid = confrel.oid
        JOIN pg_namespace confnsp ON confrel.relnamespace = confnsp.oid
        JOIN pg_attribute conatt ON conatt.attrelid = conrel.oid AND conatt.attnum = ANY(c.conkey)
        JOIN pg_attribute confatt ON confatt.attrelid = confrel.oid AND confatt.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.convalidated = true
          AND connsp.nspname = 'public' AND conrel.relname = 't_pelayan' AND conatt.attname = 'id_person'
          AND confnsp.nspname = 'public' AND confrel.relname = 'm_person' AND confatt.attname = 'id_person'
          AND array_length(c.conkey, 1) = 1 AND array_length(c.confkey, 1) = 1
          AND c.conkey[1] = conatt.attnum AND c.confkey[1] = confatt.attnum;

        IF v_fk_count = 0 THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_pelayan.id_person exists but has no valid, single-column, validated FK to public.m_person(id_person)'; END IF;
    END IF;

    -- t_relawan
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'id_person') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.id_person exists but is not UUID';
        END IF;
        
        SELECT COUNT(*) INTO v_fk_count 
        FROM pg_constraint c
        JOIN pg_class conrel ON c.conrelid = conrel.oid
        JOIN pg_namespace connsp ON conrel.relnamespace = connsp.oid
        JOIN pg_class confrel ON c.confrelid = confrel.oid
        JOIN pg_namespace confnsp ON confrel.relnamespace = confnsp.oid
        JOIN pg_attribute conatt ON conatt.attrelid = conrel.oid AND conatt.attnum = ANY(c.conkey)
        JOIN pg_attribute confatt ON confatt.attrelid = confrel.oid AND confatt.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.convalidated = true
          AND connsp.nspname = 'public' AND conrel.relname = 't_relawan' AND conatt.attname = 'id_person'
          AND confnsp.nspname = 'public' AND confrel.relname = 'm_person' AND confatt.attname = 'id_person'
          AND array_length(c.conkey, 1) = 1 AND array_length(c.confkey, 1) = 1
          AND c.conkey[1] = conatt.attnum AND c.confkey[1] = confatt.attnum;

        IF v_fk_count = 0 THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.t_relawan.id_person exists but has no valid, single-column, validated FK to public.m_person(id_person)'; END IF;
    END IF;

    -- users
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_person') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_person' AND data_type = 'uuid') THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.users.id_person exists but is not UUID';
        END IF;
        
        SELECT COUNT(*) INTO v_fk_count 
        FROM pg_constraint c
        JOIN pg_class conrel ON c.conrelid = conrel.oid
        JOIN pg_namespace connsp ON conrel.relnamespace = connsp.oid
        JOIN pg_class confrel ON c.confrelid = confrel.oid
        JOIN pg_namespace confnsp ON confrel.relnamespace = confnsp.oid
        JOIN pg_attribute conatt ON conatt.attrelid = conrel.oid AND conatt.attnum = ANY(c.conkey)
        JOIN pg_attribute confatt ON confatt.attrelid = confrel.oid AND confatt.attnum = ANY(c.confkey)
        WHERE c.contype = 'f'
          AND c.convalidated = true
          AND connsp.nspname = 'public' AND conrel.relname = 'users' AND conatt.attname = 'id_person'
          AND confnsp.nspname = 'public' AND confrel.relname = 'm_person' AND confatt.attname = 'id_person'
          AND array_length(c.conkey, 1) = 1 AND array_length(c.confkey, 1) = 1
          AND c.conkey[1] = conatt.attnum AND c.confkey[1] = confatt.attnum;

        IF v_fk_count = 0 THEN RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.users.id_person exists but has no valid, single-column, validated FK to public.m_person(id_person)'; END IF;
        
        -- Existing users cardinality duplicate validation
        EXECUTE 'SELECT COUNT(*) FROM (SELECT id_person FROM public.users WHERE id_person IS NOT NULL GROUP BY id_person HAVING COUNT(*) > 1) d' INTO v_dup_count;
        IF v_dup_count > 0 THEN
            RAISE EXCEPTION 'PREFLIGHT CARDINALITY FAILED: % existing public.users.id_person mappings violate 1:1 cardinality', v_dup_count;
        END IF;
    END IF;

    -- Preflight sys_migration_audit contract hardening (type checks)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sys_migration_audit') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'execution_id' AND data_type = 'uuid') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'migration_version' AND data_type IN ('character varying', 'text')) OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'todo_pendeta_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'todo_pelayan_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'todo_relawan_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'todo_users_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'created_person_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'mapped_users_count' AND data_type = 'integer') OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'status' AND data_type IN ('character varying', 'text')) OR
           NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sys_migration_audit' AND column_name = 'notes' AND data_type IN ('character varying', 'text')) THEN
            RAISE EXCEPTION 'PREFLIGHT SCHEMA FAILED: public.sys_migration_audit exists but is missing required contract columns or has type mismatches. Re-run compatibility requires full v1.9 schema.';
        END IF;
    END IF;
END $$;

-- 1. Create Migration Audit Ledger
CREATE TABLE IF NOT EXISTS public.sys_migration_audit (
    id SERIAL PRIMARY KEY,
    migration_version VARCHAR(50) NOT NULL,
    execution_id UUID DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Invariants Tracking
    todo_pendeta_count INT DEFAULT 0,
    todo_pelayan_count INT DEFAULT 0,
    todo_relawan_count INT DEFAULT 0,
    todo_users_count INT DEFAULT 0,
    
    created_person_count INT DEFAULT 0,
    mapped_users_count INT DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    notes TEXT
);

-- Secure the audit ledger immediately (Default Deny)
ALTER TABLE public.sys_migration_audit ENABLE ROW LEVEL SECURITY;

-- 2. Schema Foundation: m_person (Canonical Identity)
CREATE TABLE IF NOT EXISTS public.m_person (
    id_person UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap VARCHAR(150) NOT NULL,
    no_wa VARCHAR(20),
    tgl_lahir DATE,
    gender VARCHAR(10),
    foto_url TEXT,
    status_aktif VARCHAR(50) DEFAULT 'Aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure canonical identity table immediately (Default Deny)
ALTER TABLE public.m_person ENABLE ROW LEVEL SECURITY;

-- 3. Schema Foundation: FK Additions (Many-to-One / No UNIQUE constraint)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'm_pendeta' AND column_name = 'id_person') THEN
        ALTER TABLE public.m_pendeta ADD COLUMN id_person UUID REFERENCES public.m_person(id_person);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_pelayan' AND column_name = 'id_person') THEN
        ALTER TABLE public.t_pelayan ADD COLUMN id_person UUID REFERENCES public.m_person(id_person);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 't_relawan' AND column_name = 'id_person') THEN
        ALTER TABLE public.t_relawan ADD COLUMN id_person UUID REFERENCES public.m_person(id_person);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id_person') THEN
        ALTER TABLE public.users ADD COLUMN id_person UUID REFERENCES public.m_person(id_person);
    END IF;
END $$;

-- 4. Indexes (For Dual-Path Performance & Lookup)
CREATE INDEX IF NOT EXISTS idx_m_pendeta_person ON public.m_pendeta(id_person);
CREATE INDEX IF NOT EXISTS idx_t_pelayan_person ON public.t_pelayan(id_person);
CREATE INDEX IF NOT EXISTS idx_t_relawan_person ON public.t_relawan(id_person);
CREATE INDEX IF NOT EXISTS idx_users_person ON public.users(id_person);

-- users -> m_person cardinality enforcement
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_person 
ON public.users(id_person) 
WHERE id_person IS NOT NULL;

-- Temporary table to track strictly the generated persons during this execution for scoped orphan checks
DROP TABLE IF EXISTS tmp_created_persons;
CREATE TEMP TABLE tmp_created_persons (id_person UUID);

-- Temporary table to hold explicit mappings and decouple parent INSERT from child UPDATE (Blocker Fix)
DROP TABLE IF EXISTS tmp_migration_mapping;
CREATE TEMP TABLE tmp_migration_mapping (
    legacy_id VARCHAR(50),
    legacy_type VARCHAR(20),
    new_person_id UUID,
    nama VARCHAR(150),
    no_wa VARCHAR(20),
    tgl_lahir DATE,
    gender VARCHAR(10)
);


-- 5. Backfill & Reconciliation (Idempotent, Transactional, Zero-Orphan Guaranteed)
DO $$
DECLARE
    v_audit_id INT;
    v_todo_pendeta INT;
    v_todo_pelayan INT;
    v_todo_relawan INT;
    v_todo_users INT;
    
    v_created_person INT := 0;
    v_updated_pendeta INT := 0;
    v_updated_pelayan INT := 0;
    v_updated_relawan INT := 0;
    
    v_mapped_users INT := 0;
    v_orphan_count INT;
    v_invalid_count INT;
    v_duplicate_users INT;
    v_unmapped_users_remaining INT;
    v_tracked_count INT;
    
    v_inserted_count INT;
BEGIN

    -- Data Preflight Validations (Fail early, fail safely)
    SELECT COUNT(*) INTO v_invalid_count FROM public.m_pendeta WHERE id_person IS NULL AND (nama_lengkap IS NULL OR LENGTH(nama_lengkap) > 150);
    IF v_invalid_count > 0 THEN RAISE EXCEPTION 'PREFLIGHT DATA FAILED: % public.m_pendeta rows have invalid nama_lengkap', v_invalid_count; END IF;

    SELECT COUNT(*) INTO v_invalid_count FROM public.t_pelayan WHERE id_person IS NULL AND (nama IS NULL OR LENGTH(nama) > 150);
    IF v_invalid_count > 0 THEN RAISE EXCEPTION 'PREFLIGHT DATA FAILED: % public.t_pelayan rows have invalid nama', v_invalid_count; END IF;

    SELECT COUNT(*) INTO v_invalid_count FROM public.t_relawan WHERE id_person IS NULL AND (nama IS NULL OR LENGTH(nama) > 150);
    IF v_invalid_count > 0 THEN RAISE EXCEPTION 'PREFLIGHT DATA FAILED: % public.t_relawan rows have invalid nama', v_invalid_count; END IF;

    -- A. Calculate Deficits (Unmapped Legacy Rows This Run)
    SELECT COUNT(*) INTO v_todo_pendeta FROM public.m_pendeta WHERE id_person IS NULL;
    SELECT COUNT(*) INTO v_todo_pelayan FROM public.t_pelayan WHERE id_person IS NULL;
    SELECT COUNT(*) INTO v_todo_relawan FROM public.t_relawan WHERE id_person IS NULL;
    SELECT COUNT(*) INTO v_todo_users FROM public.users WHERE id_pendeta IS NOT NULL AND id_person IS NULL;

    -- Users Resolvability Preflight Check
    SELECT COUNT(*) INTO v_invalid_count
    FROM public.users u
    LEFT JOIN public.m_pendeta p ON u.id_pendeta = p.id_pendeta
    WHERE u.id_pendeta IS NOT NULL AND u.id_person IS NULL AND p.id_pendeta IS NULL;
    
    IF v_invalid_count > 0 THEN
        RAISE EXCEPTION 'PREFLIGHT DATA FAILED: % users have id_pendeta that does not exist in m_pendeta (Unresolvable mapping)', v_invalid_count;
    END IF;

    -- B. Initialize Audit Ledger
    INSERT INTO public.sys_migration_audit (
        migration_version, 
        todo_pendeta_count, 
        todo_pelayan_count, 
        todo_relawan_count,
        todo_users_count
    ) VALUES (
        'B1_UNIVERSAL_IDENTITY_v1.10', 
        v_todo_pendeta, 
        v_todo_pelayan, 
        v_todo_relawan,
        v_todo_users
    ) RETURNING id INTO v_audit_id;

    -- C. Backfill m_pendeta (Explicit Sequential Steps)
    IF v_todo_pendeta > 0 THEN
        -- 1. Generate Mapping
        INSERT INTO tmp_migration_mapping (legacy_id, legacy_type, new_person_id, nama, no_wa, tgl_lahir, gender)
        SELECT id_pendeta, 'pendeta', gen_random_uuid(), nama_lengkap, no_wa, tgl_lahir, gender
        FROM public.m_pendeta
        WHERE id_person IS NULL;

        -- 2. INSERT parent (m_person)
        WITH inserted_persons AS (
            INSERT INTO public.m_person (id_person, nama_lengkap, no_wa, tgl_lahir, gender, status_aktif)
            SELECT new_person_id, nama, no_wa, tgl_lahir, gender, 'Aktif'
            FROM tmp_migration_mapping
            WHERE legacy_type = 'pendeta'
            RETURNING id_person
        )
        SELECT COUNT(*) INTO v_inserted_count FROM inserted_persons;

        -- 3. Verify INSERT
        IF v_inserted_count != v_todo_pendeta THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Inserted m_person count (%) != Expected pendeta count (%)', v_inserted_count, v_todo_pendeta;
        END IF;
        v_created_person := v_created_person + v_inserted_count;

        -- 4. Track IDs for reconciliation
        INSERT INTO tmp_created_persons (id_person)
        SELECT new_person_id FROM tmp_migration_mapping WHERE legacy_type = 'pendeta';

        -- 5. UPDATE child (m_pendeta)
        WITH updated_pendeta AS (
            UPDATE public.m_pendeta p
            SET id_person = m.new_person_id
            FROM tmp_migration_mapping m
            WHERE p.id_pendeta = m.legacy_id AND m.legacy_type = 'pendeta'
            RETURNING p.id_person
        )
        SELECT COUNT(*) INTO v_updated_pendeta FROM updated_pendeta;

        -- 6. Verify UPDATE
        IF v_updated_pendeta != v_todo_pendeta THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Updated m_pendeta count (%) != Expected pendeta count (%)', v_updated_pendeta, v_todo_pendeta;
        END IF;
    END IF;

    -- D. Backfill t_pelayan (Explicit Sequential Steps)
    IF v_todo_pelayan > 0 THEN
        -- 1. Generate Mapping
        INSERT INTO tmp_migration_mapping (legacy_id, legacy_type, new_person_id, nama, no_wa, tgl_lahir, gender)
        SELECT id_pelayan, 'pelayan', gen_random_uuid(), nama, no_wa, tgl_lahir, gender
        FROM public.t_pelayan
        WHERE id_person IS NULL;

        -- 2. INSERT parent (m_person)
        WITH inserted_persons AS (
            INSERT INTO public.m_person (id_person, nama_lengkap, no_wa, tgl_lahir, gender, status_aktif)
            SELECT new_person_id, nama, no_wa, tgl_lahir, gender, 'Aktif'
            FROM tmp_migration_mapping
            WHERE legacy_type = 'pelayan'
            RETURNING id_person
        )
        SELECT COUNT(*) INTO v_inserted_count FROM inserted_persons;

        -- 3. Verify INSERT
        IF v_inserted_count != v_todo_pelayan THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Inserted m_person count (%) != Expected pelayan count (%)', v_inserted_count, v_todo_pelayan;
        END IF;
        v_created_person := v_created_person + v_inserted_count;

        -- 4. Track IDs for reconciliation
        INSERT INTO tmp_created_persons (id_person)
        SELECT new_person_id FROM tmp_migration_mapping WHERE legacy_type = 'pelayan';

        -- 5. UPDATE child (t_pelayan)
        WITH updated_pelayan AS (
            UPDATE public.t_pelayan p
            SET id_person = m.new_person_id
            FROM tmp_migration_mapping m
            WHERE p.id_pelayan = m.legacy_id AND m.legacy_type = 'pelayan'
            RETURNING p.id_person
        )
        SELECT COUNT(*) INTO v_updated_pelayan FROM updated_pelayan;

        -- 6. Verify UPDATE
        IF v_updated_pelayan != v_todo_pelayan THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Updated t_pelayan count (%) != Expected pelayan count (%)', v_updated_pelayan, v_todo_pelayan;
        END IF;
    END IF;

    -- E. Backfill t_relawan (Explicit Sequential Steps)
    IF v_todo_relawan > 0 THEN
        -- 1. Generate Mapping
        INSERT INTO tmp_migration_mapping (legacy_id, legacy_type, new_person_id, nama, no_wa, tgl_lahir, gender)
        SELECT id_relawan, 'relawan', gen_random_uuid(), nama, no_wa, tgl_lahir, gender
        FROM public.t_relawan
        WHERE id_person IS NULL;

        -- 2. INSERT parent (m_person)
        WITH inserted_persons AS (
            INSERT INTO public.m_person (id_person, nama_lengkap, no_wa, tgl_lahir, gender, status_aktif)
            SELECT new_person_id, nama, no_wa, tgl_lahir, gender, 'Aktif'
            FROM tmp_migration_mapping
            WHERE legacy_type = 'relawan'
            RETURNING id_person
        )
        SELECT COUNT(*) INTO v_inserted_count FROM inserted_persons;

        -- 3. Verify INSERT
        IF v_inserted_count != v_todo_relawan THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Inserted m_person count (%) != Expected relawan count (%)', v_inserted_count, v_todo_relawan;
        END IF;
        v_created_person := v_created_person + v_inserted_count;

        -- 4. Track IDs for reconciliation
        INSERT INTO tmp_created_persons (id_person)
        SELECT new_person_id FROM tmp_migration_mapping WHERE legacy_type = 'relawan';

        -- 5. UPDATE child (t_relawan)
        WITH updated_relawan AS (
            UPDATE public.t_relawan p
            SET id_person = m.new_person_id
            FROM tmp_migration_mapping m
            WHERE p.id_relawan = m.legacy_id AND m.legacy_type = 'relawan'
            RETURNING p.id_person
        )
        SELECT COUNT(*) INTO v_updated_relawan FROM updated_relawan;

        -- 6. Verify UPDATE
        IF v_updated_relawan != v_todo_relawan THEN
            RAISE EXCEPTION 'MIGRATION FAILED: Updated t_relawan count (%) != Expected relawan count (%)', v_updated_relawan, v_todo_relawan;
        END IF;
    END IF;

    -- F. Users Dual-Path Migration & Duplicate Preflight
    IF v_todo_users > 0 THEN
        -- Audit duplicate before update for ALL users (incoming collision + existing mapped users)
        SELECT COUNT(*) INTO v_duplicate_users
        FROM (
            SELECT id_person
            FROM (
                SELECT p.id_person 
                FROM public.users u
                JOIN public.m_pendeta p ON u.id_pendeta = p.id_pendeta
                WHERE u.id_person IS NULL AND p.id_person IS NOT NULL
                
                UNION ALL
                
                SELECT id_person
                FROM public.users
                WHERE id_person IS NOT NULL
            ) sub
            GROUP BY id_person 
            HAVING COUNT(*) > 1
        ) collisions;

        IF v_duplicate_users > 0 THEN
            RAISE EXCEPTION 'PREFLIGHT CARDINALITY FAILED: % id_person mappings resolve to multiple users (incoming or existing collision) in this run', v_duplicate_users;
        END IF;

        -- Apply the dual-path migration
        WITH updated_users AS (
            UPDATE public.users u
            SET id_person = p.id_person
            FROM public.m_pendeta p
            WHERE u.id_pendeta = p.id_pendeta 
              AND u.id_person IS NULL
              AND p.id_person IS NOT NULL
            RETURNING u.id
        )
        SELECT COUNT(*) INTO v_mapped_users FROM updated_users;
    END IF;

    -- G. Reconciliation Gates (Invariants Check)
    -- 1. Created vs Todo Match (Strict Equality for this run)
    IF v_created_person != (v_todo_pendeta + v_todo_pelayan + v_todo_relawan) THEN
        RAISE EXCEPTION 'RECONCILIATION FAILED: Created persons (%) != Unmapped legacy rows (%)', 
            v_created_person, (v_todo_pendeta + v_todo_pelayan + v_todo_relawan);
    END IF;

    -- 1.b. Updated Legacy vs Todo Match
    IF (v_updated_pendeta + v_updated_pelayan + v_updated_relawan) != (v_todo_pendeta + v_todo_pelayan + v_todo_relawan) THEN
        RAISE EXCEPTION 'RECONCILIATION FAILED: Updated legacy rows (%) != Unmapped legacy rows (%)', 
            (v_updated_pendeta + v_updated_pelayan + v_updated_relawan), (v_todo_pendeta + v_todo_pelayan + v_todo_relawan);
    END IF;

    -- 1.c. Tracked vs Created Match
    SELECT COUNT(*) INTO v_tracked_count FROM tmp_created_persons;
    IF v_tracked_count != v_created_person THEN
        RAISE EXCEPTION 'RECONCILIATION FAILED: Tracked created persons (%) != Created persons (%)', 
            v_tracked_count, v_created_person;
    END IF;

    -- 2. Users Mapped Match
    IF v_mapped_users != v_todo_users THEN
        RAISE EXCEPTION 'RECONCILIATION FAILED: Mapped users (%) != Users needing mapping (%)', 
            v_mapped_users, v_todo_users;
    END IF;
    
    -- 2.b. Users Explicit Missing Role Assertion
    SELECT COUNT(*) INTO v_unmapped_users_remaining
    FROM public.users u
    WHERE u.id_pendeta IS NOT NULL
      AND u.id_person IS NULL;
      
    IF v_unmapped_users_remaining > 0 THEN
        RAISE EXCEPTION 'USERS MAPPING FAILED: % users with id_pendeta remain without id_person', v_unmapped_users_remaining;
    END IF;

    -- 3. Zero Orphans Check in Legacy
    SELECT COUNT(*) INTO v_orphan_count FROM public.m_pendeta WHERE id_person IS NULL;
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'ORPHAN CHECK FAILED: % public.m_pendeta records lack id_person', v_orphan_count; END IF;

    SELECT COUNT(*) INTO v_orphan_count FROM public.t_pelayan WHERE id_person IS NULL;
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'ORPHAN CHECK FAILED: % public.t_pelayan records lack id_person', v_orphan_count; END IF;

    SELECT COUNT(*) INTO v_orphan_count FROM public.t_relawan WHERE id_person IS NULL;
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'ORPHAN CHECK FAILED: % public.t_relawan records lack id_person', v_orphan_count; END IF;

    -- 4. Migration-Scoped Zero Orphans Check in m_person
    -- Only checks m_person rows CREATED DURING THIS EXECUTION run (tmp_created_persons).
    SELECT COUNT(*) INTO v_orphan_count 
    FROM tmp_created_persons p
    LEFT JOIN public.m_pendeta md ON md.id_person = p.id_person
    LEFT JOIN public.t_pelayan pl ON pl.id_person = p.id_person
    LEFT JOIN public.t_relawan rl ON rl.id_person = p.id_person
    WHERE md.id_person IS NULL AND pl.id_person IS NULL AND rl.id_person IS NULL;
    
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'ORPHAN CHECK FAILED: % newly created public.m_person records are not referenced by any role table', v_orphan_count; END IF;

    -- H. Finalize Ledger
    UPDATE public.sys_migration_audit 
    SET created_person_count = v_created_person,
        mapped_users_count = v_mapped_users,
        status = 'COMPLETED',
        completed_at = NOW(),
        notes = 'Migration successful. ' || v_created_person || ' person identities created, ' || v_mapped_users || ' users mapped.'
    WHERE id = v_audit_id;

END $$;

COMMIT;
