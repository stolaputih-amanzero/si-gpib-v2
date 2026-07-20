const fs = require('fs');
const path = require('path');

const gpibDir = path.join(__dirname, '..', 'GPIB');
const migrationSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260721_fix_kmj_quotes_bajem.sql');

function cleanString(str) {
    if (!str) return '';
    let s = str.trim();
    while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.substring(1, s.length - 1).trim();
    }
    s = s.replace(/""/g, '"');
    while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.substring(1, s.length - 1).trim();
    }
    return s;
}

function parseTsv(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const headers = lines[0].split('\t').map(h => cleanString(h));
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] !== undefined ? cleanString(values[idx]) : '';
        });
        data.push(row);
    }
    return data;
}

function escapeSql(str) {
    if (!str || str.length === 0) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
}

function parseNum(str) {
    if (!str) return 'NULL';
    const val = str.replace(/,/g, '.');
    const num = parseFloat(val);
    if (isNaN(num)) return 'NULL';
    return num;
}

// Read TSVs
const jemaatRaw = fs.readFileSync(path.join(gpibDir, 'Jemaat.txt'), 'utf-8');
const pendetaRaw = fs.readFileSync(path.join(gpibDir, 'Pendeta.txt'), 'utf-8');
const posRaw = fs.readFileSync(path.join(gpibDir, 'Pospelkes.txt'), 'utf-8');

const jemaatList = parseTsv(jemaatRaw).filter(r => r['ID Jemaat']);
const pendetaList = parseTsv(pendetaRaw).filter(r => r['ID Pendeta']);
const posList = parseTsv(posRaw).filter(r => r['ID Pos']);

console.log(`Parsed ${jemaatList.length} Jemaat, ${pendetaList.length} Pendeta, ${posList.length} Pos Pelkes`);

let sql = `-- Migration: 20260721_fix_kmj_quotes_bajem.sql
-- Description: Clean double quotes, seed missing KMJs from Jemaat.txt, add kategori (Bajem/Pos Pelkes) column to m_pos_pelkes

BEGIN;

-- 1. Add kategori column to m_pos_pelkes if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='m_pos_pelkes' AND column_name='kategori'
    ) THEN
        ALTER TABLE m_pos_pelkes ADD COLUMN kategori VARCHAR(50) DEFAULT 'Pos Pelkes';
    END IF;
END $$;

`;

// Clean m_jemaat_induk names & keterangan
sql += `-- 2. Update m_jemaat_induk (cleaned names & keterangan)\n`;
jemaatList.forEach(j => {
    const cleanedNama = cleanString(j['Nama Jemaat']);
    const cleanedKet = cleanString(j['Keterangan']);
    sql += `UPDATE m_jemaat_induk SET nama_induk = ${escapeSql(cleanedNama)}, keterangan = ${escapeSql(cleanedKet)} WHERE id_induk = ${escapeSql(j['ID Jemaat'])};\n`;
});

// Clean m_pos_pelkes names & set kategori
sql += `\n-- 3. Update m_pos_pelkes (cleaned names & set kategori Bajem / Pos Pelkes)\n`;
posList.forEach(p => {
    const cleanedNama = cleanString(p['Nama Pos']);
    const isBajem = cleanedNama.toLowerCase().startsWith('bajem');
    const kategori = isBajem ? 'Bajem' : 'Pos Pelkes';
    sql += `UPDATE m_pos_pelkes SET nama_pos = ${escapeSql(cleanedNama)}, kategori = ${escapeSql(kategori)} WHERE id_pos = ${escapeSql(p['ID Pos'])};\n`;
});

// Clean m_pendeta names
sql += `\n-- 4. Update m_pendeta (cleaned names)\n`;
pendetaList.forEach(p => {
    const cleanedNama = cleanString(p['Nama Pendeta']);
    sql += `UPDATE m_pendeta SET nama_lengkap = ${escapeSql(cleanedNama)} WHERE id_pendeta = ${escapeSql(p['ID Pendeta'])};\n`;
});

// Process KMJs from Jemaat.txt
sql += `\n-- 5. Insert/Update KMJs from Jemaat.txt into m_pendeta & m_jemaat_induk\n`;

let kmjAddedCount = 0;
jemaatList.forEach(j => {
    const idInduk = j['ID Jemaat'];
    const namaKmj = cleanString(j['Nama KMJ']);
    const noWa = cleanString(j['Nomor Telepon']);

    if (namaKmj && namaKmj.length > 0) {
        // Check if pendeta already exists in Pendeta.txt for this jemaat
        let existingPendeta = pendetaList.find(p => p['ID Jemaat'] === idInduk && p['Nama Pendeta'].toLowerCase().includes(namaKmj.toLowerCase()));
        if (!existingPendeta) {
            existingPendeta = pendetaList.find(p => p['Nama Pendeta'].toLowerCase().includes(namaKmj.toLowerCase()));
        }

        let idPendeta = existingPendeta ? existingPendeta['ID Pendeta'] : `PDT-KMJ-${idInduk}`;

        if (!existingPendeta) {
            // Insert new pendeta KMJ
            sql += `INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, jabatan, is_kmj, is_pj) VALUES (${escapeSql(idPendeta)}, ${escapeSql(idInduk)}, ${escapeSql(namaKmj)}, ${escapeSql(noWa)}, 'KMJ', TRUE, FALSE) ON CONFLICT (id_pendeta) DO UPDATE SET id_induk = EXCLUDED.id_induk, is_kmj = TRUE;\n`;
            kmjAddedCount++;
        } else {
            // Update existing pendeta to be KMJ and set id_induk
            sql += `UPDATE m_pendeta SET id_induk = ${escapeSql(idInduk)}, is_kmj = TRUE, jabatan = COALESCE(jabatan, 'KMJ') WHERE id_pendeta = ${escapeSql(idPendeta)};\n`;
        }

        // Link id_kmj on m_jemaat_induk
        sql += `UPDATE m_jemaat_induk SET id_kmj = ${escapeSql(idPendeta)} WHERE id_induk = ${escapeSql(idInduk)};\n`;
    }
});

sql += `\nCOMMIT;\n`;

fs.writeFileSync(migrationSqlPath, sql);
console.log(`Generated migration script at ${migrationSqlPath} with ${kmjAddedCount} new KMJ pendeta records.`);
