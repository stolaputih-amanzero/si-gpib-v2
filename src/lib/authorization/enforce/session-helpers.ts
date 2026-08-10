import type { ContextLevel } from '../types';

export interface MockSession {
  user_id: string;
  person_id: string | null;
  claimed_context_id: string;
  claimed_context_level: ContextLevel;
}

export async function getMockSession(): Promise<MockSession | null> {
  // In Phase 5, this will be: 
  // const supabase = createServerClient(); 
  // const { data } = await supabase.auth.getSession();
  // return data.session
  
  // For now, return a mock session for testing
  return {
    user_id: 'mock-user-uuid',
    person_id: 'mock-person-id',
    claimed_context_id: 'POS-001',
    claimed_context_level: 'POS'
  };
}

export function getClaimedContextFromSession(session: MockSession): string {
  return session.claimed_context_id;
}
