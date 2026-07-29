'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  user: any | null;
  email: string;
  nama: string;
  role: string;
  avatarUrl?: string;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export function useUser(): UserProfile {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user && isMounted) {
          setUser(data.user);
          setIsLoading(false);
          return;
        }
      } catch {}

      // Fallback fetch from /api/auth/me (cookie session)
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const body = await res.json();
          if (body?.user && isMounted) {
            setUser(body.user);
            setIsLoading(false);
            return;
          }
        }
      } catch {}

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadUser();

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user && isMounted) {
          setUser(session.user);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const email = user?.email || 'Tamu (Belum Login)';
  const metadata = user?.user_metadata || {};
  const nama =
    user?.nama_lengkap ||
    metadata.nama_lengkap ||
    metadata.full_name ||
    metadata.name ||
    (user?.email ? user.email.split('@')[0] : 'Pelayan Pos Pelkes');

  let role = user?.role || metadata.role || 'Pengurus Pos Pelkes / Presbiter';
  if (role === 'user' || role === 'User') role = 'pendeta';

  const avatarUrl = metadata.avatar_url || metadata.picture;

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore errors if offline
    } finally {
      window.location.href = '/api/auth/logout';
    }
  };

  return {
    user,
    email,
    nama,
    role,
    avatarUrl,
    isLoading,
    logout,
  };
}
