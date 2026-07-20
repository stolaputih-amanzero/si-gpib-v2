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

async function runSyncPjAndPenugasan() {
    console.log('🚀 Starting PJ flags, t_pj_jemaat & t_penugasan_pendeta remote synchronization...');

    const pendetaRaw = fs.readFileSync(path.join(gpibDir, 'Pendeta.txt'), 'utf-8');
    const posRaw = fs.readFileSync(path.join(gpibDir, 'Pospelkes.txt'), 'utf-8');

    const pendetaList = parseTsv(pendetaRaw).filter(r => r['ID Pendeta']);
    const posList = parseTsv(posRaw).filter(r => r['ID Pos']);

    // 1. Update is_pj = true for all pendeta in Pendeta.txt that are not KMJ
    console.log('1. Setting is_pj = TRUE and jabatan = Pendeta Jemaat on m_pendeta...');
    for (const p of pendetaList) {
        const idPendeta = p['ID Pendeta'];
        const idInduk = p['ID Jemaat'];

        // Get current pendeta record
        const { data: curr } = await supabase
            .from('m_pendeta')
            .select('is_kmj, is_pj, jabatan')
            .eq('id_pendeta', idPendeta)
            .single();

        if (curr && !curr.is_kmj) {
            await supabase
                .from('m_pendeta')
                .update({
                    is_pj: true,
                    jabatan: curr.jabatan || 'Pendeta Jemaat',
                })
                .eq('id_pendeta', idPendeta);
        }

        // 2. Insert into t_pj_jemaat if idInduk exists
        if (idInduk) {
            await supabase
                .from('t_pj_jemaat')
                .upsert({
                    id_induk: idInduk,
                    id_pendeta: idPendeta,
                    tanggal_mulai: '2024-01-01',
                    status: 'Aktif',
                }, { onConflict: 'id_induk, id_pendeta' });
        }
    }

    // 3. Insert into t_penugasan_pendeta from Pospelkes.txt
    console.log('2. Inserting active assignments into t_penugasan_pendeta from Pospelkes.txt...');
    let penugasanCount = 0;

    for (const pos of posList) {
        const idPos = pos['ID Pos'];
        const idPendeta = pos['ID Pendeta'];

        if (idPos && idPendeta) {
            const idTugas = `TGS-${idPos}-${idPendeta}`;
            const { error: tgsErr } = await supabase
                .from('t_penugasan_pendeta')
                .upsert({
                    id_tugas: idTugas,
                    id_pendeta: idPendeta,
                    id_pos: idPos,
                    tgl_mulai: '2024-01-01',
                    status_tugas: 'Aktif',
                }, { onConflict: 'id_tugas' });

            if (!tgsErr) penugasanCount++;
        }
    }

    console.log(`✅ SUCCESS! Updated is_pj flags for ${pendetaList.length} pendeta and inserted ${penugasanCount} active Pos assignments into Supabase.`);
}

runSyncPjAndPenugasan().catch(err => {
    console.error('Fatal error during PJ sync:', err);
    process.exit(1);
});
