const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

let supabaseUrl = '';
let serviceRoleKey = '';

envContent.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        serviceRoleKey = line.split('=')[1].trim();
    }
});

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase credentials missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
});

const gpibDir = path.join(__dirname, '..', 'GPIB');

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

async function runSync() {
    console.log('🚀 Starting Supabase remote data synchronization...');

    const jemaatRaw = fs.readFileSync(path.join(gpibDir, 'Jemaat.txt'), 'utf-8');
    const pendetaRaw = fs.readFileSync(path.join(gpibDir, 'Pendeta.txt'), 'utf-8');
    const posRaw = fs.readFileSync(path.join(gpibDir, 'Pospelkes.txt'), 'utf-8');

    const jemaatList = parseTsv(jemaatRaw).filter(r => r['ID Jemaat']);
    const pendetaList = parseTsv(pendetaRaw).filter(r => r['ID Pendeta']);
    const posList = parseTsv(posRaw).filter(r => r['ID Pos']);

    // 1. Clean m_jemaat_induk names & keterangan
    console.log('1. Updating m_jemaat_induk clean names...');
    for (const j of jemaatList) {
        const cleanedNama = cleanString(j['Nama Jemaat']);
        const cleanedKet = cleanString(j['Keterangan']);
        await supabase
            .from('m_jemaat_induk')
            .update({ nama_induk: cleanedNama, keterangan: cleanedKet })
            .eq('id_induk', j['ID Jemaat']);
    }

    // 2. Clean m_pos_pelkes names & kategori
    console.log('2. Updating m_pos_pelkes names and kategori (Bajem / Pos Pelkes)...');
    for (const p of posList) {
        const cleanedNama = cleanString(p['Nama Pos']);
        const isBajem = cleanedNama.toLowerCase().startsWith('bajem');
        const kategori = isBajem ? 'Bajem' : 'Pos Pelkes';
        
        // Attempt update (ignoring if kategori column doesn't exist yet on DB)
        const { error } = await supabase
            .from('m_pos_pelkes')
            .update({ nama_pos: cleanedNama, kategori })
            .eq('id_pos', p['ID Pos']);

        if (error && error.message.includes('kategori')) {
            await supabase
                .from('m_pos_pelkes')
                .update({ nama_pos: cleanedNama })
                .eq('id_pos', p['ID Pos']);
        }
    }

    // 3. Clean m_pendeta names
    console.log('3. Updating m_pendeta clean names...');
    for (const p of pendetaList) {
        const cleanedNama = cleanString(p['Nama Pendeta']);
        await supabase
            .from('m_pendeta')
            .update({ nama_lengkap: cleanedNama })
            .eq('id_pendeta', p['ID Pendeta']);
    }

    // 4. Process KMJ from Jemaat.txt
    console.log('4. Syncing KMJs from Jemaat.txt into m_pendeta & m_jemaat_induk...');
    let syncedKmjCount = 0;

    for (const j of jemaatList) {
        const idInduk = j['ID Jemaat'];
        const namaKmj = cleanString(j['Nama KMJ']);
        const noWa = cleanString(j['Nomor Telepon']);

        if (namaKmj && namaKmj.length > 0) {
            let existingPendeta = pendetaList.find(p => p['ID Jemaat'] === idInduk && p['Nama Pendeta'].toLowerCase().includes(namaKmj.toLowerCase()));
            if (!existingPendeta) {
                existingPendeta = pendetaList.find(p => p['Nama Pendeta'].toLowerCase().includes(namaKmj.toLowerCase()));
            }

            let idPendeta = existingPendeta ? existingPendeta['ID Pendeta'] : `PDT-KMJ-${idInduk}`;

            // Upsert pendeta into m_pendeta
            const { error: pendetaErr } = await supabase
                .from('m_pendeta')
                .upsert({
                    id_pendeta: idPendeta,
                    id_induk: idInduk,
                    nama_lengkap: namaKmj,
                    no_wa: noWa || null,
                    jabatan: 'KMJ',
                    is_kmj: true,
                    is_pj: false,
                });

            if (pendetaErr) {
                console.error(`Failed to upsert KMJ ${namaKmj} (${idPendeta}):`, pendetaErr.message);
            } else {
                // Link id_kmj in m_jemaat_induk
                const { error: jemaatErr } = await supabase
                    .from('m_jemaat_induk')
                    .update({ id_kmj: idPendeta })
                    .eq('id_induk', idInduk);

                if (jemaatErr) {
                    console.error(`Failed to link KMJ ${idPendeta} to Jemaat ${idInduk}:`, jemaatErr.message);
                } else {
                    syncedKmjCount++;
                }
            }
        }
    }

    console.log(`✅ SUCCESS! Synced ${syncedKmjCount} KMJ records directly to Supabase remote database.`);
}

runSync().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
