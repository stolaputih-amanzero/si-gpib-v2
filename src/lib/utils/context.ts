import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { MockIdentityResolver } from '@/lib/authorization/engine/identity-resolver';
import { MockContextResolver } from '@/lib/authorization/engine/context-resolver';

export async function getServerContext() {
  const cookieStore = await cookies();
  const contextId = cookieStore.get('sigpib_active_context')?.value;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { status: 'UNAUTHORIZED', context_id: null };
  }

  const identityResolver = new MockIdentityResolver();
  const baseIdentity = await identityResolver.resolveBase(session);
  const contextResolver = new MockContextResolver();

  if (contextId) {
    const activeContext = await contextResolver.resolve(contextId, baseIdentity);
    if (activeContext) {
      return { status: 'VALID', context_id: contextId };
    } else {
      // Constraint C: User lost access or cookie is invalid -> CONTEXT_STALE
      // We cannot delete the cookie here because this is called during Server Component rendering.
      // The frontend should catch CONTEXT_STALE and call a Server Action to clear it or redirect.
      return { status: 'CONTEXT_STALE', context_id: null };
    }
  }

  // Fallback: If no cookie is present, attempt to use the user's homebase context
  const homebase = baseIdentity.person_linkage?.homebase_context_id;
  if (homebase) {
    const activeContext = await contextResolver.resolve(homebase, baseIdentity);
    if (activeContext) {
      // We cannot set the cookie here because this is called during Server Component rendering.
      // We just return it as VALID. The client PosProvider can set it if it wants, or it will just naturally be used as the default.
      return { status: 'VALID', context_id: homebase };
    }
  }
  
  return { status: 'NO_AVAILABLE_CONTEXT', context_id: null };
}
