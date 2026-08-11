-- ============================================================================
-- F8 PASTORAL TRANSFER & RELOCATION ENGINE MIGRATION
-- Reference Implementation #7 (Dual-Context Relocation & Service Continuity)
-- ============================================================================

-- 0. RECONCILIATION AUDIT TRAIL LOG TABLE
CREATE TABLE IF NOT EXISTS public.sys_reconciliation_audit_logs (
    id_log TEXT PRIMARY KEY DEFAULT ('RECON-' || gen_random_uuid()::text),
    table_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    id_person TEXT,
    action TEXT NOT NULL,
    reason TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. PHYSICAL TABLE: TRANSFER PROPOSALS (t_mutasi_pelayan)
CREATE TABLE IF NOT EXISTS public.t_mutasi_pelayan (
    id_mutasi TEXT PRIMARY KEY DEFAULT ('MUTASI-' || gen_random_uuid()::text),
    id_person TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    id_org_asal TEXT NOT NULL,
    nama_org_asal TEXT NOT NULL,
    id_org_tujuan TEXT NOT NULL,
    nama_org_tujuan TEXT NOT NULL,
    status_mutasi TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status_mutasi IN ('PROPOSED', 'APPROVED_SINODE', 'REJECTED', 'DEPLOYED', 'CANCELLED')),
    tanggal_efektif DATE,
    catatan TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconcile t_mutasi_pelayan if pre-existed from legacy schemas
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS id_person TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS nama_lengkap TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS id_org_asal TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS nama_org_asal TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS id_org_tujuan TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS nama_org_tujuan TEXT;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS status_mutasi TEXT DEFAULT 'PROPOSED';
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS tanggal_efektif DATE;
ALTER TABLE public.t_mutasi_pelayan ADD COLUMN IF NOT EXISTS catatan TEXT;

-- 2. PHYSICAL TABLE: PASTORAL SERVICE POSTINGS (t_penugasan_pendeta)
CREATE TABLE IF NOT EXISTS public.t_penugasan_pendeta (
    id_penugasan TEXT PRIMARY KEY DEFAULT ('NUGAS-' || gen_random_uuid()::text),
    id_person TEXT NOT NULL,
    id_pos TEXT NOT NULL,
    nama_organisasi TEXT NOT NULL,
    jabatan TEXT NOT NULL DEFAULT 'Ketua Majelis Jemaat',
    tanggal_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_selesai DATE,
    status_penugasan TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status_penugasan IN ('ACTIVE', 'TRANSFERRED', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconcile t_penugasan_pendeta if pre-existed in legacy schemas
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS id_penugasan TEXT DEFAULT ('NUGAS-' || gen_random_uuid()::text);
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS id_person TEXT;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS id_pos TEXT;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS nama_organisasi TEXT;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS jabatan TEXT DEFAULT 'Ketua Majelis Jemaat';
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS tanggal_mulai DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS tanggal_selesai DATE;
ALTER TABLE public.t_penugasan_pendeta ADD COLUMN IF NOT EXISTS status_penugasan TEXT DEFAULT 'ACTIVE';

-- Populate id_person & reconcile legacy status_tugas values with strict mapping & audit trail
DO $$
DECLARE
    r RECORD;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 't_penugasan_pendeta' AND column_name = 'id_pendeta'
    ) THEN
        UPDATE public.t_penugasan_pendeta 
        SET id_person = COALESCE(id_person, id_pendeta) 
        WHERE id_person IS NULL;
    END IF;

    -- Strict Mapping (No Guesswork)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 't_penugasan_pendeta' AND column_name = 'status_tugas'
    ) THEN
        UPDATE public.t_penugasan_pendeta 
        SET status_penugasan = CASE 
            WHEN status_tugas ILIKE 'aktif' THEN 'ACTIVE' 
            WHEN status_tugas ILIKE 'selesai' THEN 'TRANSFERRED'
            WHEN status_tugas ILIKE 'mutasi' THEN 'TRANSFERRED'
            ELSE 'INACTIVE'
        END
        WHERE status_penugasan IS NULL;
    END IF;

    -- Deduplicate pre-existing duplicate ACTIVE assignments with Audit Logging:
    FOR r IN (
        WITH RankedActiveAssignments AS (
            SELECT 
                id_penugasan,
                id_person,
                id_pos,
                nama_organisasi,
                ROW_NUMBER() OVER (
                    PARTITION BY id_person 
                    ORDER BY COALESCE(tanggal_mulai, created_at::date) DESC, created_at DESC
                ) as rn
            FROM public.t_penugasan_pendeta
            WHERE status_penugasan = 'ACTIVE' AND id_person IS NOT NULL
        )
        SELECT * FROM RankedActiveAssignments WHERE rn > 1
    ) LOOP
        -- Archive older active assignment
        UPDATE public.t_penugasan_pendeta
        SET 
            status_penugasan = 'TRANSFERRED',
            tanggal_selesai = COALESCE(tanggal_selesai, CURRENT_DATE)
        WHERE id_penugasan = r.id_penugasan;

        -- Record Audit Log for Historical Integrity
        INSERT INTO public.sys_reconciliation_audit_logs (
            table_name,
            entity_id,
            id_person,
            action,
            reason,
            metadata
        ) VALUES (
            't_penugasan_pendeta',
            r.id_penugasan,
            r.id_person,
            'ARCHIVE_DUPLICATE_ACTIVE',
            'Legacy data reconciliation: archived older duplicate ACTIVE assignment while retaining historical continuity.',
            jsonb_build_object(
                'id_pos', r.id_pos,
                'nama_organisasi', r.nama_organisasi,
                'reconciled_at', NOW()
            )
        );
    END LOOP;
END $$;

-- Indexing for fast lookup
CREATE INDEX IF NOT EXISTS idx_mutasi_person ON public.t_mutasi_pelayan (id_person);
CREATE INDEX IF NOT EXISTS idx_penugasan_person ON public.t_penugasan_pendeta (id_person);

-- 3. DATABASE INVARIANT: SINGLE ACTIVE ASSIGNMENT CONSTRAINT
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_assignment 
ON public.t_penugasan_pendeta (id_person) 
WHERE (status_penugasan = 'ACTIVE' AND id_person IS NOT NULL);

-- Enable RLS
ALTER TABLE public.t_mutasi_pelayan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.t_penugasan_pendeta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_reconciliation_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. ATOMIC RELOCATION & STATE TRANSITION RPC
CREATE OR REPLACE FUNCTION public.transition_pastoral_transfer_atomic(
    p_id_mutasi TEXT,
    p_action TEXT,
    p_catatan TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_uid UUID;
    v_action TEXT;
    v_transfer RECORD;
    v_new_status TEXT;
    v_log_exists BOOLEAN;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required for transfer transitions.';
    END IF;

    -- Idempotency Check
    IF p_request_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.sys_transaction_logs WHERE request_id = p_request_id
        ) INTO v_log_exists;

        IF v_log_exists THEN
            RETURN public.get_pastoral_transfer_360((SELECT id_mutasi FROM public.t_mutasi_pelayan WHERE id_mutasi = p_id_mutasi));
        END IF;
    END IF;

    v_action := LOWER(TRIM(p_action));

    SELECT * INTO v_transfer FROM public.t_mutasi_pelayan WHERE id_mutasi = p_id_mutasi FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'TRANSFER_NOT_FOUND: Specified transfer request does not exist.';
    END IF;

    -- Validate State Transition Matrix
    IF v_action = 'approve' THEN
        IF v_transfer.status_mutasi != 'PROPOSED' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Can only approve transfers in PROPOSED state.';
        END IF;
        v_new_status := 'APPROVED_SINODE';

    ELSIF v_action = 'reject' THEN
        IF v_transfer.status_mutasi != 'PROPOSED' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Can only reject transfers in PROPOSED state.';
        END IF;
        v_new_status := 'REJECTED';

    ELSIF v_action = 'deploy' THEN
        IF v_transfer.status_mutasi != 'APPROVED_SINODE' THEN
            RAISE EXCEPTION 'INVALID_TRANSITION: Can only deploy transfers in APPROVED_SINODE state.';
        END IF;
        v_new_status := 'DEPLOYED';

        -- ATOMIC ASSIGNMENT MUTATION IN SINGLE TRANSACTION BOUNDARY
        -- 1. Archive current active assignment to TRANSFERRED
        UPDATE public.t_penugasan_pendeta
        SET 
            status_penugasan = 'TRANSFERRED',
            tanggal_selesai = CURRENT_DATE
        WHERE id_person = v_transfer.id_person AND status_penugasan = 'ACTIVE';

        -- 2. Insert new active assignment for receiving organization
        INSERT INTO public.t_penugasan_pendeta (
            id_person,
            id_pos,
            nama_organisasi,
            jabatan,
            tanggal_mulai,
            status_penugasan
        ) VALUES (
            v_transfer.id_person,
            v_transfer.id_org_tujuan,
            v_transfer.nama_org_tujuan,
            'Ketua Majelis Jemaat',
            CURRENT_DATE,
            'ACTIVE'
        );

    ELSE
        RAISE EXCEPTION 'INVALID_ACTION: Unknown transfer action specified.';
    END IF;

    -- Update Transfer Lifecycle Record
    UPDATE public.t_mutasi_pelayan
    SET 
        status_mutasi = v_new_status,
        catatan = COALESCE(p_catatan, catatan),
        updated_at = NOW()
    WHERE id_mutasi = p_id_mutasi;

    -- Record Idempotency Log
    IF p_request_id IS NOT NULL THEN
        INSERT INTO public.sys_transaction_logs (request_id, entity_id, action, status)
        VALUES (p_request_id, p_id_mutasi, v_action, v_new_status)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN public.get_pastoral_transfer_360(p_id_mutasi);
END;
$$;

-- 5. READ MODEL QUERY RPC: GET PASTORAL TRANSFER 360
CREATE OR REPLACE FUNCTION public.get_pastoral_transfer_360(
    p_id_mutasi TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_uid UUID;
    v_transfer RECORD;
    v_current_assignment JSONB;
    v_assignment_history JSONB;
BEGIN
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Authentication required.';
    END IF;

    SELECT * INTO v_transfer FROM public.t_mutasi_pelayan WHERE id_mutasi = p_id_mutasi;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Current Active Assignment
    SELECT jsonb_build_object(
        'id_penugasan', p.id_penugasan,
        'id_person', p.id_person,
        'id_pos', p.id_pos,
        'nama_organisasi', p.nama_organisasi,
        'jabatan', p.jabatan,
        'tanggal_mulai', p.tanggal_mulai,
        'tanggal_selesai', p.tanggal_selesai,
        'status_penugasan', p.status_penugasan
    ) INTO v_current_assignment
    FROM public.t_penugasan_pendeta p
    WHERE p.id_person = v_transfer.id_person AND p.status_penugasan = 'ACTIVE';

    -- Historical Service Chain
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id_penugasan', h.id_penugasan,
            'id_person', h.id_person,
            'id_pos', h.id_pos,
            'nama_organisasi', h.nama_organisasi,
            'jabatan', h.jabatan,
            'tanggal_mulai', h.tanggal_mulai,
            'tanggal_selesai', h.tanggal_selesai,
            'status_penugasan', h.status_penugasan
        ) ORDER BY h.tanggal_mulai DESC
    ), '[]'::jsonb) INTO v_assignment_history
    FROM public.t_penugasan_pendeta h
    WHERE h.id_person = v_transfer.id_person;

    RETURN jsonb_build_object(
        'id_mutasi', v_transfer.id_mutasi,
        'transfer', jsonb_build_object(
            'id_mutasi', v_transfer.id_mutasi,
            'id_person', v_transfer.id_person,
            'nama_lengkap', v_transfer.nama_lengkap,
            'id_org_asal', v_transfer.id_org_asal,
            'nama_org_asal', v_transfer.nama_org_asal,
            'id_org_tujuan', v_transfer.id_org_tujuan,
            'nama_org_tujuan', v_transfer.nama_org_tujuan,
            'status_mutasi', v_transfer.status_mutasi,
            'tanggal_efektif', v_transfer.tanggal_efektif,
            'catatan', v_transfer.catatan,
            'created_at', v_transfer.created_at
        ),
        'current_assignment', v_current_assignment,
        'assignment_history', v_assignment_history
    );
END;
$$;
