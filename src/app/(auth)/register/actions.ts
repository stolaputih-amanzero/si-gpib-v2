'use server';

import { createClient } from '@/lib/supabase/server';

export async function registerUser(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get('email') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();
  const phone = (formData.get('phone') as string || '').trim();

  if (!email || !password || !phone) {
    return { error: 'Semua field wajib diisi' };
  }

  // 1. Duplicate check against public.users table for existing Email
  try {
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id, email')
      .ilike('email', email)
      .maybeSingle();

    if (existingEmail) {
      return {
        error: 'Email ini sudah terdaftar dalam sistem. Silakan gunakan email lain atau masuk ke akun Anda.',
      };
    }
  } catch (err) {
    console.warn('Check existing email error:', err);
  }

  // 2. Duplicate check against public.users table for existing Phone
  try {
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id, no_hp')
      .eq('no_hp', phone)
      .maybeSingle();

    if (existingPhone) {
      return {
        error: 'Nomor telepon ini sudah terdaftar dalam sistem. Silakan gunakan nomor WA/HP lain atau masuk ke akun Anda.',
      };
    }
  } catch (err) {
    console.warn('Check existing phone error:', err);
  }

  // 3. Always assign temporary 'read_only' role for new sign ups
  const defaultRole = 'read_only';

  // 4. Register using Supabase Auth signUp
  const { error } = await supabase.auth.signUp({
    email,
    password,
    phone,
    options: {
      data: {
        phone: phone,
        role: defaultRole,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('unique constraint')) {
      return {
        error: 'Email atau nomor telepon ini sudah terdaftar dalam sistem. Silakan gunakan data lain atau masuk.',
      };
    }
    return { error: error.message };
  }

  return { success: true };
}
