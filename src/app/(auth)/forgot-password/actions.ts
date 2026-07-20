'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email wajib diisi' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
