'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { MockIdentityResolver } from '@/lib/authorization/engine/identity-resolver';
import { MockContextResolver } from '@/lib/authorization/engine/context-resolver';

export async function setWorkingContext(context_id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized: No active session');
  }

  const identityResolver = new MockIdentityResolver();
  const baseIdentity = await identityResolver.resolveBase(session);

  const contextResolver = new MockContextResolver();
  const activeContext = await contextResolver.resolve(context_id, baseIdentity);

  if (!activeContext) {
    // If invalid context, reject the change
    throw new Error('Forbidden: Context resolution failed or unauthorized access to this context.');
  }

  // Constraint A: Minimal payload (only context_id)
  const cookieStore = await cookies();
  cookieStore.set('sigpib_active_context', context_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  revalidatePath('/', 'layout');
  return { success: true, context_id };
}
