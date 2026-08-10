BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(7);

-- 1. Test Anon Rejection
SET ROLE anon;
SELECT throws_like(
    $$ SELECT process_pengajuan_bantuan('test_ajuan', 'approve', 'test notes', 'super_user'); $$,
    '%permission denied for function process_pengajuan_bantuan%',
    'RPC should completely reject anon execution due to REVOKE EXECUTE FROM anon'
);

-- 2. Setup mock data for authenticated test
SET ROLE postgres;
-- Create mock users
INSERT INTO auth.users (id, email) VALUES 
('f0f0f0f0-0000-0000-0000-000000000001', 'test_kmj@example.com'),
('f0f0f0f0-0000-0000-0000-000000000002', 'test_jemaat@example.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.users (id, role, email) VALUES 
('f0f0f0f0-0000-0000-0000-000000000001', 'kmj', 'test_kmj@example.com'),
('f0f0f0f0-0000-0000-0000-000000000002', 'jemaat', 'test_jemaat@example.com')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- Create mock pos
INSERT INTO public.m_pos_pelkes (id_pos, nama_pos) VALUES ('POS-TEST', 'Pos Pelkes Test') ON CONFLICT DO NOTHING;

-- Create mock ajuan
INSERT INTO public.t_pengajuan_bantuan (id_ajuan, status, jenis_bantuan, urgensi, biaya, id_pos) 
VALUES 
('AJU-TEST-1', 'Pending_KMJ', 'Pendidikan', 'Rendah', 10000, 'POS-TEST'),
('AJU-TEST-SPOOF', 'Pending_KMJ', 'Pendidikan', 'Rendah', 10000, 'POS-TEST')
ON CONFLICT (id_ajuan) DO UPDATE SET status = EXCLUDED.status;

-- 3. Authenticate as low-privilege 'kmj' user and test valid legacy execution
SET ROLE authenticated;
-- Mock auth.uid()
SET request.jwt.claim.sub = 'f0f0f0f0-0000-0000-0000-000000000001';

-- Execute the legacy RPC passing 'super_user' as the role_approver parameter
SELECT lives_ok(
    $$ SELECT process_pengajuan_bantuan('AJU-TEST-1', 'approve', 'Spoof attempt', 'super_user'); $$,
    'RPC should allow authenticated KMJ user to execute successfully due to legacy behavior'
);

-- 4. Authenticate as ineligible 'jemaat' user and attempt role spoofing
SET ROLE authenticated;
SET request.jwt.claim.sub = 'f0f0f0f0-0000-0000-0000-000000000002';

-- Execute the legacy RPC passing 'super_user', expecting failure because actual role is 'jemaat'
-- The Architect requested this must fail. Note: if the RPC lacks internal role checks and bypasses RLS,
-- this test might expose that the generic workflow allows any role to approve.
SELECT throws_like(
    $$ SELECT process_pengajuan_bantuan('AJU-TEST-SPOOF', 'approve', 'Spoof attempt 2', 'super_user'); $$,
    '%',
    'RPC MUST fail when an ineligible role (jemaat) attempts to approve, even if spoofing p_role_approver'
);

-- 5. Verify that the DB ignored 'super_user' and used the actual 'kmj' role
SET ROLE postgres;
SELECT results_eq(
    $$ SELECT role_approver FROM t_approval_bantuan WHERE id_ajuan = 'AJU-TEST-1' LIMIT 1 $$,
    ARRAY['kmj'],
    'RPC MUST ignore p_role_approver payload and record the actual database user role (kmj)'
);

SELECT results_eq(
    $$ SELECT status FROM t_pengajuan_bantuan WHERE id_ajuan = 'AJU-TEST-1' LIMIT 1 $$,
    ARRAY['Pending_Mupel'],
    'RPC MUST transition the status successfully per legacy workflow logic'
);

-- Verify no transition or audit occurred for the spoof attempt
SELECT is_empty(
    $$ SELECT 1 FROM t_approval_bantuan WHERE id_ajuan = 'AJU-TEST-SPOOF' $$,
    'Spoof attempt by ineligible role MUST NOT create an audit log'
);

SELECT results_eq(
    $$ SELECT status FROM t_pengajuan_bantuan WHERE id_ajuan = 'AJU-TEST-SPOOF' LIMIT 1 $$,
    ARRAY['Pending_KMJ'],
    'Spoof attempt by ineligible role MUST NOT transition the status'
);

SELECT * FROM finish();
ROLLBACK;
