const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  console.log('Seeding pj.test@gpib.local...');
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'pj.test@gpib.local',
    password: 'UbahSaya123!',
    email_confirm: true,
    user_metadata: { role: 'pj', nama_lengkap: 'PJ Test' }
  });

  if (authError) {
    console.log('Auth error:', authError.message);
    if (!authError.message.includes('already registered')) return;
  }

  // Get user id if already exists
  let userId = authData?.user?.id;
  if (!userId) {
    const { data: listData } = await supabase.auth.admin.listUsers();
    const user = listData?.users?.find(u => u.email === 'pj.test@gpib.local');
    if (user) userId = user.id;
  }

  if (userId) {
    // Ensure password is correct
    await supabase.auth.admin.updateUserById(userId, { password: 'UbahSaya123!' });
    
    // Insert/upsert into public.users
    const { error: dbError } = await supabase.from('users').upsert({
      id: userId,
      email: 'pj.test@gpib.local',
      role: 'pj',
      nama_lengkap: 'PJ Test E2E'
    });
    
    if (dbError) {
      console.log('DB error:', dbError.message);
    } else {
      console.log('User pj.test@gpib.local ready!');
    }
  }
}

seed();
