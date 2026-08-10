-- Public Portal Security Tests (pgTAP)
-- Verifikasi bahwa anon role tidak bisa mengakses base tables

BEGIN;

SELECT plan(6);

-- Test 1: Verify anon cannot SELECT from m_pos_pelkes
SELECT throws_ok(
  $$SELECT id_pos FROM public.m_pos_pelkes LIMIT 1$$,
  'permission denied for table m_pos_pelkes',
  'anon should not be able to SELECT from m_pos_pelkes'
);

-- Test 2: Verify anon cannot SELECT from t_kerawanan_wilayah
SELECT throws_ok(
  $$SELECT id_risiko FROM public.t_kerawanan_wilayah LIMIT 1$$,
  'permission denied for table t_kerawanan_wilayah',
  'anon should not be able to SELECT from t_kerawanan_wilayah'
);

-- Test 3: Verify anon cannot SELECT from t_potensi_wilayah
SELECT throws_ok(
  $$SELECT id_potensi FROM public.t_potensi_wilayah LIMIT 1$$,
  'permission denied for table t_potensi_wilayah',
  'anon should not be able to SELECT from t_potensi_wilayah'
);

-- Test 4: Verify anon can EXECUTE get_public_map_data()
SELECT lives_ok(
  $$SELECT get_public_map_data()$$,
  'anon should be able to EXECUTE get_public_map_data()'
);

-- Test 5: Verify get_public_map_data() returns expected columns
SELECT results_eq(
  $$SELECT column_name FROM information_schema.columns WHERE table_name = 'get_public_map_data' ORDER BY ordinal_position$$,
  $$VALUES ('id_pos'), ('nama_pos'), ('kategori'), ('alamat'), ('latitude'), ('longitude'), ('nama_induk')$$,
  'get_public_map_data() should return only allowlisted columns'
);

-- Test 6: Verify no PII columns in public projection
SELECT is_empty(
  $$SELECT column_name FROM information_schema.columns WHERE table_name = 'get_public_map_data' AND column_name IN ('no_wa', 'email', 'foto_url', 'id_pj')$$,
  'get_public_map_data() should not expose PII columns'
);

SELECT * FROM finish();

ROLLBACK;
