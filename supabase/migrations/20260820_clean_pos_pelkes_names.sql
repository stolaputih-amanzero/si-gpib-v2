-- Migration: Clean redundant prefixes (Pos Pelkes, Pospelkes, Bajem, GPIB, etc.) from m_pos_pelkes nama_pos

UPDATE m_pos_pelkes
SET nama_pos = TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      nama_pos,
      '^(GPIB\s+Pos\s*Pelkese?\s*|Pos\s*Pelkese?\s*GPIB\s*|Pos\s*Pelkese?\s*\/\s*Bajem\s*|Pospelkes\s*|Pos\s*Pelkese?\s*|Pos\s*Pelayanan\s*Kesaksian\s*|Bakal\s*Jemaat\s*|Bajem\s*|GPIB\s+)+',
      '',
      'gi'
    ),
    '["''«»]',
    '',
    'g'
  )
)
WHERE nama_pos ~* '^(GPIB|Pos|Pospelkes|Bajem|Bakal)';
