'use server'

import { createClient } from '@/lib/supabase/server'

export async function registerUser(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string

  if (!email || !password || !phone) {
    return { error: 'Semua field wajib diisi' }
  }

  // Use Supabase Auth signUp. The metadata will trigger our DB trigger to insert into public.users
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    phone, // Supabase native phone field (optional, we can also put it in data)
    options: {
      data: {
        phone: phone, // Storing in raw_user_meta_data for our trigger
        role: role,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
