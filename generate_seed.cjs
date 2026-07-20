const fs = require('fs');
const path = require('path');

const gpibDir = path.join(__dirname, 'GPIB');
const seedSqlPath = path.join(__dirname, 'supabase', 'seed.sql');

function parseTsv(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const headers = lines[0].split('\t');
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const row = {};
        headers.forEach((h, idx) => {
            row[h.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
        });
        data.push(row);
    }
    return data;
}

function escapeSql(str) {
    if (!str) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
}

function parseNum(str) {
    if (!str) return 'NULL';
    const val = str.replace(/,/g, '.');
    const num = parseFloat(val);
    if (isNaN(num)) return 'NULL';
    return num;
}

function deduplicate(data, keyProp) {
    const seen = new Set();
    return data.filter(row => {
        const key = row[keyProp];
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// 1. Jemaat
const jemaatContent = fs.readFileSync(path.join(gpibDir, 'Jemaat.txt'), 'utf-8');
let jemaatData = parseTsv(jemaatContent).filter(r => r['Nama Jemaat']);
jemaatData = deduplicate(jemaatData, 'ID Jemaat');
let sql = `\n\n-- Seeding m_jemaat_induk\n`;
sql += `INSERT INTO m_jemaat_induk (id_induk, id_mupel, nama_induk, keterangan, latitude, longitude) VALUES\n`;
const jemaatValues = jemaatData.map(row => {
    const lat = parseNum(row['Latitude']) || 0;
    const lng = parseNum(row['Longitude']) || 0;
    return `(${escapeSql(row['ID Jemaat'])}, ${escapeSql(row['ID Mupel'])}, ${escapeSql(row['Nama Jemaat'])}, ${escapeSql(row['Keterangan'])}, ${lat}, ${lng})`;
});
if (jemaatValues.length > 0) {
    sql += jemaatValues.join(',\n') + '\nON CONFLICT (id_induk) DO UPDATE SET nama_induk = EXCLUDED.nama_induk, id_mupel = EXCLUDED.id_mupel, keterangan = EXCLUDED.keterangan, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;\n';
}

// 2. Pendeta
const pendetaContent = fs.readFileSync(path.join(gpibDir, 'Pendeta.txt'), 'utf-8');
let pendetaData = parseTsv(pendetaContent).filter(r => r['Nama Pendeta']);
pendetaData = deduplicate(pendetaData, 'ID Pendeta');
sql += `\n-- Seeding m_pendeta\n`;
sql += `INSERT INTO m_pendeta (id_pendeta, id_induk, nama_lengkap, no_wa, tgl_tugas, keterangan) VALUES\n`;
const pendetaValues = pendetaData.map(row => {
    let tgl = row['Tanggal Mulai Melayani'];
    if (!tgl || tgl.includes('#')) {
        tgl = null;
    }
    return `(${escapeSql(row['ID Pendeta'])}, ${escapeSql(row['ID Jemaat'])}, ${escapeSql(row['Nama Pendeta'])}, ${escapeSql(row['No. Telepon'])}, ${escapeSql(tgl)}, ${escapeSql(row['Catatan'])})`;
});
if (pendetaValues.length > 0) {
    sql += pendetaValues.join(',\n') + '\nON CONFLICT (id_pendeta) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, id_induk = EXCLUDED.id_induk, no_wa = EXCLUDED.no_wa, tgl_tugas = EXCLUDED.tgl_tugas, keterangan = EXCLUDED.keterangan;\n';
}

// 3. Pospelkes
const pospelkesContent = fs.readFileSync(path.join(gpibDir, 'Pospelkes.txt'), 'utf-8');
let pospelkesData = parseTsv(pospelkesContent).filter(r => r['Nama Pos']);
pospelkesData = deduplicate(pospelkesData, 'ID Pos');
sql += `\n-- Seeding m_pos_pelkes\n`;
sql += `INSERT INTO m_pos_pelkes (id_pos, id_induk, nama_pos, latitude, longitude) VALUES\n`;
const posValues = pospelkesData.map(row => {
    return `(${escapeSql(row['ID Pos'])}, ${escapeSql(row['ID Jemaat'])}, ${escapeSql(row['Nama Pos'])}, ${parseNum(row['Latitude'])}, ${parseNum(row['Longitude'])})`;
});
if (posValues.length > 0) {
    sql += posValues.join(',\n') + '\nON CONFLICT (id_pos) DO UPDATE SET nama_pos = EXCLUDED.nama_pos, id_induk = EXCLUDED.id_induk, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;\n';
}

// 4. Users
const usersContent = fs.readFileSync(path.join(gpibDir, 'users.txt'), 'utf-8');
let usersData = parseTsv(usersContent).filter(r => r['Role']);
usersData = deduplicate(usersData, 'Email');
sql += `\n-- Seeding users\n`;
sql += `INSERT INTO users (id, no_telepon, email, password_hash, id_pendeta, role, status) VALUES\n`;
const usersValues = usersData.map(row => {
    let idPendeta = row['ID_Pendeta'];
    if (idPendeta && idPendeta.startsWith('ADM-')) {
        idPendeta = null;
    }
    return `(gen_random_uuid(), ${escapeSql(row['No_Telepon'])}, ${escapeSql(row['Email'])}, ${escapeSql(row['Password'])}, ${escapeSql(idPendeta)}, ${escapeSql(row['Role'])}, ${escapeSql(row['Status'])})`;
});
if (usersValues.length > 0) {
    sql += usersValues.join(',\n') + '\nON CONFLICT (email) DO UPDATE SET no_telepon = EXCLUDED.no_telepon, password_hash = EXCLUDED.password_hash, id_pendeta = EXCLUDED.id_pendeta, role = EXCLUDED.role, status = EXCLUDED.status;\n';
}

fs.appendFileSync(seedSqlPath, sql);
console.log('Seed data successfully appended to seed.sql');
