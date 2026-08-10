CREATE OR REPLACE FUNCTION set_authorization_context(
  p_context_id VARCHAR,
  p_context_level VARCHAR,
  p_user_id UUID,
  p_person_id VARCHAR,
  p_effective_role VARCHAR
) RETURNS void AS $$
BEGIN
  -- The 'true' parameter makes these settings local to the current transaction (SV-09, SV-10)
  PERFORM set_config('app.active_context_id', p_context_id, true);
  PERFORM set_config('app.active_context_level', p_context_level, true);
  PERFORM set_config('app.user_id', p_user_id::text, true);
  PERFORM set_config('app.linked_person_id', COALESCE(p_person_id, ''), true);
  PERFORM set_config('app.effective_system_role', p_effective_role, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
