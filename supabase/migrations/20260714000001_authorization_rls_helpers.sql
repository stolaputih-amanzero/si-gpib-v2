-- HF-01 to HF-05: Session Variable Readers
CREATE OR REPLACE FUNCTION get_active_context_id() RETURNS VARCHAR AS $$
  SELECT NULLIF(current_setting('app.active_context_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_active_context_level() RETURNS VARCHAR AS $$
  SELECT NULLIF(current_setting('app.active_context_level', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_linked_person_id() RETURNS VARCHAR AS $$
  SELECT NULLIF(current_setting('app.linked_person_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_effective_system_role() RETURNS VARCHAR AS $$
  SELECT NULLIF(current_setting('app.effective_system_role', true), '');
$$ LANGUAGE sql STABLE;

-- HF-06: is_descendant_pos (Evaluates if a Pos is within the active context's downward reach)
CREATE OR REPLACE FUNCTION is_descendant_pos(target_pos_id VARCHAR) RETURNS BOOLEAN AS $$
DECLARE
  ctx_id VARCHAR;
  ctx_level VARCHAR;
BEGIN
  ctx_id := get_active_context_id();
  ctx_level := get_active_context_level();
  
  IF ctx_level = 'POS' THEN
    RETURN target_pos_id = ctx_id;
  ELSIF ctx_level = 'JEMAAT' THEN
    RETURN EXISTS (SELECT 1 FROM m_pos_pelkes WHERE id_pos = target_pos_id AND id_induk = ctx_id);
  ELSIF ctx_level = 'MUPEL' THEN
    RETURN EXISTS (
      SELECT 1 FROM m_pos_pelkes p 
      JOIN m_jemaat_induk j ON p.id_induk = j.id_induk 
      WHERE p.id_pos = target_pos_id AND j.id_mupel = ctx_id
    );
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- HF-07: is_descendant_jemaat
CREATE OR REPLACE FUNCTION is_descendant_jemaat(target_jemaat_id VARCHAR) RETURNS BOOLEAN AS $$
DECLARE
  ctx_id VARCHAR;
  ctx_level VARCHAR;
BEGIN
  ctx_id := get_active_context_id();
  ctx_level := get_active_context_level();
  
  IF ctx_level = 'JEMAAT' THEN
    RETURN target_jemaat_id = ctx_id;
  ELSIF ctx_level = 'MUPEL' THEN
    RETURN EXISTS (SELECT 1 FROM m_jemaat_induk WHERE id_induk = target_jemaat_id AND id_mupel = ctx_id);
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- HF-08: has_global_scope (Contract-gated, NOT an unconditional bypass)
CREATE OR REPLACE FUNCTION has_global_scope() RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_effective_system_role() = 'super_user';
END;
$$ LANGUAGE plpgsql STABLE;

-- HF-09: is_self_person
CREATE OR REPLACE FUNCTION is_self_person(target_person_id VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
  RETURN target_person_id = get_linked_person_id();
END;
$$ LANGUAGE plpgsql STABLE;
