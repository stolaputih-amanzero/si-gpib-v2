import os

migration_path = r'd:\PROJECT\si-gpib-v2\supabase\migrations\20260906_b1_universal_identity.sql'
test_path = r'd:\PROJECT\si-gpib-v2\scratch\test_b1_migration.sql'

with open(migration_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

inner_script = []
for line in lines:
    if line.strip().upper() in ('BEGIN;', 'COMMIT;'):
        continue
    inner_script.append(line)

inner_script_str = ''.join(inner_script)

test_content = """-- ====================================================================================
-- B1 UNIVERSAL IDENTITY MIGRATION - TEST HARNESS
-- ====================================================================================
-- INSTRUCTIONS:
-- Eksekusi blok pengujian di bawah ini secara mandiri di Supabase SQL Editor / psql.
-- Seluruh pengujian dibungkus dalam `BEGIN; ... ROLLBACK;` sehingga tidak ada
-- mutasi permanen pada database Live/Staging Anda.
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- PHASE 1: SCHEMA FIXTURE TESTS (Boundary Testing)
-- ------------------------------------------------------------------------------------

-- TEST 1.1: Database tanpa tabel legacy
-- Target: PREFLIGHT SCHEMA FAILED (Abort)
BEGIN;
DROP TABLE IF EXISTS public.m_pendeta CASCADE;
{script}
ROLLBACK;

-- TEST 1.2: Partial m_person tanpa UUID id_person
-- Target: PREFLIGHT SCHEMA FAILED (Abort)
BEGIN;
CREATE TABLE public.m_person (id_person TEXT, nama_lengkap VARCHAR(150) NOT NULL); 
{script}
ROLLBACK;

-- TEST 1.3: Composite PK pada m_person
-- Target: PREFLIGHT SCHEMA FAILED (Abort)
BEGIN;
CREATE TABLE public.m_person (id_person UUID, temp_id UUID, nama_lengkap VARCHAR(150) NOT NULL, PRIMARY KEY(id_person, temp_id));
{script}
ROLLBACK;

-- TEST 1.4: Audit Table Type Mismatch
-- Target: PREFLIGHT SCHEMA FAILED (Abort)
BEGIN;
CREATE TABLE public.sys_migration_audit (execution_id UUID, migration_version TEXT, todo_pendeta_count TEXT); 
{script}
ROLLBACK;


-- ------------------------------------------------------------------------------------
-- PHASE 2 & 3: DATA FIXTURE & IDEMPOTENCY TEST (Happy Path)
-- ------------------------------------------------------------------------------------
BEGIN;

-- 1. SEED FIXTURE DATA
INSERT INTO public.m_pendeta (id_pendeta, nama_lengkap, no_wa, tgl_lahir, gender, status)
VALUES 
('P-001', 'Pendeta Test 1', '0811', '1980-01-01', 'L', 'Aktif'),
('P-002', 'Pendeta Test 2', '0812', '1982-01-01', 'P', 'Aktif');

INSERT INTO public.t_pelayan (id_pelayan, nama, no_wa, tgl_lahir, gender, status)
VALUES 
('PL-001', 'Pelayan Test 1', '0821', '1990-01-01', 'L', 'Aktif'),
('PL-002', 'Pelayan Test 2', '0822', '1992-01-01', 'P', 'Aktif'),
('PL-003', 'Pelayan Test 3', '0823', '1994-01-01', 'L', 'Aktif');

INSERT INTO public.t_relawan (id_relawan, nama, no_wa, tgl_lahir, gender)
VALUES 
('R-001', 'Relawan Test 1', '0831', '1995-01-01', 'P'),
('R-002', 'Relawan Test 2', '0832', '1996-01-01', 'L');

-- 2. EXECUTE RUN 1 (CORE MIGRATION)
{script}

-- 3. ASSERT PHASE 2 (DATA FIXTURE)
DO $$
DECLARE
    v_person_count INT;
    v_orphan_count INT;
BEGIN
    SELECT COUNT(*) INTO v_person_count FROM public.m_person;
    IF v_person_count != 7 THEN 
        RAISE EXCEPTION 'TEST FAILED: Diharapkan 7 m_person, didapatkan %', v_person_count; 
    END IF;

    SELECT COUNT(*) INTO v_orphan_count FROM public.m_pendeta WHERE id_person IS NULL;
    IF v_orphan_count > 0 THEN RAISE EXCEPTION 'TEST FAILED: Ditemukan % orphan m_pendeta', v_orphan_count; END IF;
    
    RAISE NOTICE 'PHASE 2 DATA FIXTURE: PASSED!';
END $$;

-- Tangkap state Set of Identities setelah RUN 1
CREATE TEMP TABLE tmp_id_person_state_1 AS SELECT id_person FROM public.m_person;

-- 4. EXECUTE RUN 2 (IDEMPOTENCY)
{script}

-- 5. ASSERT PHASE 3 (IDEMPOTENCY)
DO $$
DECLARE
    v_person_count INT;
    v_audit_record RECORD;
    v_diff_count INT;
BEGIN
    SELECT COUNT(*) INTO v_person_count FROM public.m_person;
    IF v_person_count != 7 THEN 
        RAISE EXCEPTION 'TEST FAILED: Idempotency rusak. Diharapkan 7 m_person, didapatkan %', v_person_count; 
    END IF;
    
    SELECT COUNT(*) INTO v_diff_count
    FROM (
        (SELECT id_person FROM public.m_person EXCEPT SELECT id_person FROM tmp_id_person_state_1)
        UNION ALL
        (SELECT id_person FROM tmp_id_person_state_1 EXCEPT SELECT id_person FROM public.m_person)
    ) diff;
    
    IF v_diff_count > 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Idempotency rusak. % set id_person berbeda pasca Run 2', v_diff_count;
    END IF;

    SELECT * INTO v_audit_record FROM public.sys_migration_audit ORDER BY id DESC LIMIT 1;
    IF v_audit_record.created_person_count != 0 THEN
        RAISE EXCEPTION 'TEST FAILED: Idempotency rusak. Sistem membuat % identitas pada run ke-2', v_audit_record.created_person_count;
    END IF;

    RAISE NOTICE 'PHASE 3 IDEMPOTENCY: PASSED!';
END $$;

ROLLBACK;

-- ------------------------------------------------------------------------------------
-- PHASE 4: ROLLBACK / FORCED FAILURE INJECTION TEST
-- ------------------------------------------------------------------------------------
BEGIN;
INSERT INTO public.t_relawan (id_relawan, nama, no_wa, tgl_lahir, gender) VALUES ('R-999', 'Relawan Gagal', '0000', '2000-01-01', 'L');

{script_with_error}

-- 3. Eksekusi transaction ini pasti akan mengalami ERROR/ROLLBACK otomatis.
-- RAISE EXCEPTION di-inject ke dalam skrip aslinya
"""

script_with_error = inner_script_str + "\nDO $$\nBEGIN\nRAISE EXCEPTION 'INJECTED FAILURE TEST FOR ROLLBACK';\nEND $$;\n"

# String replace instead of format to avoid bracket escaping issues with DO $$
test_content = test_content.replace('{script}', inner_script_str)
test_content = test_content.replace('{script_with_error}', script_with_error)

with open(test_path, 'w', encoding='utf-8') as f:
    f.write(test_content)
