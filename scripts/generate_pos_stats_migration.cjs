const fs = require('fs');
const path = require('path');

const pospelkesContent = fs.readFileSync(path.join(__dirname, '..', 'GPIB', 'Pospelkes.txt'), 'utf-8');
const lines = pospelkesContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const headers = lines[0].split('\t');

let sql = `-- Migration: Add jumlah_kk & jumlah_jiwa columns to m_pos_pelkes\n`;
sql += `ALTER TABLE m_pos_pelkes ADD COLUMN IF NOT EXISTS jumlah_kk INT DEFAULT 0;\n`;
sql += `ALTER TABLE m_pos_pelkes ADD COLUMN IF NOT EXISTS jumlah_jiwa INT DEFAULT 0;\n\n`;

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split('\t');
  const id_pos = (values[0] || '').trim();
  const rawKk = (values[4] || '').trim();
  const rawJiwa = (values[5] || '').trim();

  const kk = parseInt(rawKk, 10);
  const jiwa = parseInt(rawJiwa, 10);

  if (id_pos && (!isNaN(kk) || !isNaN(jiwa))) {
    sql += `UPDATE m_pos_pelkes SET jumlah_kk = ${isNaN(kk) ? 0 : kk}, jumlah_jiwa = ${isNaN(jiwa) ? 0 : jiwa} WHERE id_pos = '${id_pos}';\n`;
  }
}

// Fallback logic: Update from t_demografi_pelkat if available and > 0
sql += `\n-- Update from demografi pelkat for pos pelkes without explicit excel numbers\n`;
sql += `UPDATE m_pos_pelkes p SET 
  jumlah_kk = COALESCE((SELECT SUM(jml_kk) FROM t_demografi_pelkat WHERE id_pos = p.id_pos), p.jumlah_kk, 0),
  jumlah_jiwa = COALESCE((SELECT SUM(laki + perempuan) FROM t_demografi_pelkat WHERE id_pos = p.id_pos), p.jumlah_jiwa, 0)
WHERE p.jumlah_kk = 0 OR p.jumlah_jiwa = 0;\n`;

fs.writeFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '20260731_pos_pelkes_stats.sql'), sql);
console.log('Migration generated successfully!');
