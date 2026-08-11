import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_USERS = {
  self: { email: 'f2.self@gpib.test', password: 'Password123!', name: 'F2 Test Self' },
  same: { email: 'f2.same@gpib.test', password: 'Password123!', name: 'F2 Test Same' },
  outside: { email: 'f2.outside@gpib.test', password: 'Password123!', name: 'F2 Test Outside' }
};

async function createTestUser(email: string, password: string, name: string) {
  let userData: any = null;
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nama_lengkap: name, role: 'user' }
    });
    if (error) throw error;
    userData = data.user;
  } catch (error: any) {
    if (error?.message?.includes('already exists') || error?.message?.includes('already been registered') || error?.message?.includes('already registered')) {
      console.log(`User ${email} already exists. We will reuse it (Note: password will not be updated).`);
      const key: string = serviceRoleKey || '';
      const tempClient = createClient(supabaseUrl || '', key, { auth: { persistSession: false } });
      const { data: loginData, error: loginErr } = await tempClient.auth.signInWithPassword({ email, password });
      if (loginErr) throw new Error(`Could not login to existing user ${email}: ${loginErr.message}`);
      userData = loginData.user;
    } else {
      throw error;
    }
  }
  
  // Wait a bit to ensure trigger creates public.users
  await new Promise(r => setTimeout(r, 2000));
  
  return userData;
}

async function runSeeder() {
  console.log("🌱 Seeding F2 Test Users...");

  // 1. Get two valid Jemaat Induk for context mapping
  const { data: induks, error: errInduk } = await supabase
    .from('m_jemaat_induk')
    .select('id_induk, id_mupel')
    .limit(2);

  if (errInduk || !induks || induks.length < 2) {
    console.error("Failed to fetch at least 2 jemaat induk for context seeding", errInduk);
    return;
  }

  const contextA = induks[0];
  const contextB = induks[1];
  console.log(`Found Context A: ${contextA.id_induk} (Mupel ${contextA.id_mupel})`);
  console.log(`Found Context B: ${contextB.id_induk} (Mupel ${contextB.id_mupel})`);

  // 2. Create Users
  const userSelf = await createTestUser(TEST_USERS.self.email, TEST_USERS.self.password, TEST_USERS.self.name);
  const userSame = await createTestUser(TEST_USERS.same.email, TEST_USERS.same.password, TEST_USERS.same.name);
  const userOutside = await createTestUser(TEST_USERS.outside.email, TEST_USERS.outside.password, TEST_USERS.outside.name);

  // 3. Create canonical Person for Self
  const personId = `88888888-8888-4888-8888-${userSelf.id.substring(24)}`;
  console.log(`Creating canonical m_person for Self: ${personId}`);
  
  // Clean up any old person
  await supabase.from('m_person').delete().eq('id_person', personId);

  const { error: errPerson } = await supabase.from('m_person').insert({
    id_person: personId,
    nama_lengkap: TEST_USERS.self.name,
    no_wa: '08111111111'
  });
  if (errPerson && errPerson.code !== '23505') {
    throw new Error("Failed to insert m_person: " + errPerson.message);
  } else if (errPerson && errPerson.code === '23505') {
    console.log("m_person already exists, skipping insert.");
  }

  // 4. Create Pendeta Assignment for Self in Context A
  const id_pendeta = `PDT-TEST-${Math.floor(Math.random()*10000)}`;
  const { error: errPendeta } = await supabase.from('m_pendeta').insert({
    id_pendeta,
    id_person: personId,
    id_induk: contextA.id_induk,
    status: 'Aktif',
    nama_lengkap: TEST_USERS.self.name,
    jabatan: 'Pendeta Jemaat'
  });
  if (errPendeta) console.warn("Failed to insert m_pendeta (might exist or missing FK):", errPendeta.message);

  // 5. Create some test Pastoral logs for Self
  await supabase.from('t_log_pastoral').insert([
    {
      id_log: `LOG-TEST-1-${Date.now()}`,
      id_pendeta,
      tgl: new Date().toISOString(),
      kegiatan: 'Perkunjungan F2 Test',
      catatan: 'Catatan RAHASIA ini hanya boleh dilihat oleh SELF'
    }
  ]);

  // 6. Update public.users for authorization context
  console.log("Updating authorization contexts in public.users...");
  
  // Self gets Context A, Person ID
  await supabase.from('users').update({
    id_induk: contextA.id_induk,
    id_mupel: contextA.id_mupel,
    id_person: personId
  }).eq('id', userSelf.id);

  // Same gets Context A
  await supabase.from('users').update({
    id_induk: contextA.id_induk,
    id_mupel: contextA.id_mupel
  }).eq('id', userSame.id);

  // Outside gets Context B
  await supabase.from('users').update({
    id_induk: contextB.id_induk,
    id_mupel: contextB.id_mupel
  }).eq('id', userOutside.id);

  console.log("\n✅ Test data successfully seeded!");
  
  // 7. Update .env
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  envContent = envContent.replace(/TEST_PERSON_SELF_EMAIL=.*/, `TEST_PERSON_SELF_EMAIL=${TEST_USERS.self.email}`);
  envContent = envContent.replace(/TEST_PERSON_SELF_PASSWORD=.*/, `TEST_PERSON_SELF_PASSWORD=${TEST_USERS.self.password}`);
  envContent = envContent.replace(/TEST_PERSON_SELF_ID=.*/, `TEST_PERSON_SELF_ID=${personId}`);

  envContent = envContent.replace(/TEST_PERSON_SAME_CONTEXT_EMAIL=.*/, `TEST_PERSON_SAME_CONTEXT_EMAIL=${TEST_USERS.same.email}`);
  envContent = envContent.replace(/TEST_PERSON_SAME_CONTEXT_PASSWORD=.*/, `TEST_PERSON_SAME_CONTEXT_PASSWORD=${TEST_USERS.same.password}`);

  envContent = envContent.replace(/TEST_PERSON_OUTSIDE_CONTEXT_EMAIL=.*/, `TEST_PERSON_OUTSIDE_CONTEXT_EMAIL=${TEST_USERS.outside.email}`);
  envContent = envContent.replace(/TEST_PERSON_OUTSIDE_CONTEXT_PASSWORD=.*/, `TEST_PERSON_OUTSIDE_CONTEXT_PASSWORD=${TEST_USERS.outside.password}`);

  fs.writeFileSync(envPath, envContent);
  console.log("✅ Updated .env file with new credentials.");
  console.log("\n🚀 You can now run: npx tsx scratch/test_f2_api.ts");
}

runSeeder().catch(console.error);
