-- supabase/migrations/20260902_pastoral_stats_rpc.sql

CREATE OR REPLACE FUNCTION get_pastoral_stats(
  p_id_jemaat VARCHAR,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- RBAC: Pastikan user adalah KMJ dari jemaat ini
  IF NOT EXISTS (
    SELECT 1 FROM m_jemaat_induk 
    WHERE id_induk = p_id_jemaat 
      AND id_kmj = (SELECT id_pendeta FROM users WHERE id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'RBAC_VIOLATION: Anda bukan KMJ dari jemaat ini';
  END IF;

  SELECT jsonb_build_object(
    'total_log', COUNT(*),
    'total_jiwa', COALESCE(SUM(jml_jiwa), 0),
    'total_pos', COUNT(DISTINCT id_pos),
    'total_pendeta', COUNT(DISTINCT id_pendeta),
    'avg_jiwa_per_log', ROUND(COALESCE(AVG(jml_jiwa), 0)::NUMERIC, 1),
    'latest_log', MAX(created_at)
  ) INTO result
  FROM t_log_pastoral
  WHERE id_pos IN (
    SELECT id_pos FROM m_pos_pelkes WHERE id_induk = p_id_jemaat
  )
  AND tgl BETWEEN p_start_date AND p_end_date;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION get_pastoral_stats FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_pastoral_stats TO authenticated;
