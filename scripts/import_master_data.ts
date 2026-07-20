import { createClient } from '@supabase/supabase-js';
import * as xlsx from 'xlsx';
import { readFileSync } from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Regex Validators
const ID_FORMATS = {
  mupel: /^M - \d{2}$/,
  jemaat: /^\d{2}-\d{2}-[A-Z]{2}$/,
  pos: /^POS-\d{5}$/,
  pendeta: /^PDT-\d{8}$/,
};

async function importMasterData() {
  console.log('Mulai proses import data master dari GPIB.xlsx...');

  try {
    const filePath = path.resolve(process.cwd(), 'GPIB.xlsx');
    const fileBuffer = readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

    // 1. Import Mupel
    console.log('Importing Mupel...');
    const mupelSheet = workbook.Sheets['Mupel'];
    if (mupelSheet) {
      const mupelData: any[] = xlsx.utils.sheet_to_json(mupelSheet);
      for (const row of mupelData) {
        if (!ID_FORMATS.mupel.test(row.id_mupel)) {
          console.warn(`Format ID Mupel invalid: ${row.id_mupel}`);
          continue;
        }
        await supabase.from('m_mupel').upsert({
          id_mupel: row.id_mupel,
          nama_mupel: row.nama_mupel,
          keterangan: row.keterangan
        });
      }
      console.log(`Berhasil import ${mupelData.length} data Mupel`);
    }

    // 2. Import Jemaat
    console.log('Importing Jemaat Induk...');
    const jemaatSheet = workbook.Sheets['Jemaat'];
    if (jemaatSheet) {
      const jemaatData: any[] = xlsx.utils.sheet_to_json(jemaatSheet);
      for (const row of jemaatData) {
         if (!ID_FORMATS.jemaat.test(row.id_induk)) {
          console.warn(`Format ID Jemaat invalid: ${row.id_induk}`);
          continue;
        }
        await supabase.from('m_jemaat_induk').upsert({
          id_induk: row.id_induk,
          id_mupel: row.id_mupel,
          nama_induk: row.nama_induk,
          alamat: row.alamat,
          latitude: row.latitude,
          longitude: row.longitude
        });
      }
    }

    // 3. Import Pos Pelkes
    console.log('Importing Pos Pelkes...');
    const posSheet = workbook.Sheets['Pos Pelkes'];
    if (posSheet) {
      const posData: any[] = xlsx.utils.sheet_to_json(posSheet);
      for (const row of posData) {
         if (!ID_FORMATS.pos.test(row.id_pos)) {
          console.warn(`Format ID Pos invalid: ${row.id_pos}`);
          continue;
        }
        await supabase.from('m_pos_pelkes').upsert({
          id_pos: row.id_pos,
          id_induk: row.id_induk,
          nama_pos: row.nama_pos,
          alamat: row.alamat,
          latitude: row.latitude,
          longitude: row.longitude,
          tgl_berdiri: row.tgl_berdiri
        });
      }
    }

    // 4. Import Pendeta
    console.log('Importing Pendeta...');
    const pendetaSheet = workbook.Sheets['Pendeta'];
    if (pendetaSheet) {
      const pendetaData: any[] = xlsx.utils.sheet_to_json(pendetaSheet);
      for (const row of pendetaData) {
         if (!ID_FORMATS.pendeta.test(row.id_pendeta)) {
          console.warn(`Format ID Pendeta invalid: ${row.id_pendeta}`);
          continue;
        }
        await supabase.from('m_pendeta').upsert({
          id_pendeta: row.id_pendeta,
          id_induk: row.id_induk,
          nama_lengkap: row.nama_lengkap,
          no_wa: row.no_wa,
          jabatan: row.jabatan,
          status: row.status,
          is_kmj: row.is_kmj || false,
          is_pj: row.is_pj || false
        });
      }
    }

    console.log('Import Master Data selesai!');
  } catch (error) {
    console.error('Error saat import data:', error);
  }
}

importMasterData();
