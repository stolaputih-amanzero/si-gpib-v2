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
  const [user, setUser] = useState<any | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('si_gpib_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return !localStorage.getItem('si_gpib_cached_user');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUser() {
      // 1. Fetch from /api/auth/me first (merges auth session + public.users table avatar & profile)
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const body = await res.json();
          if (body?.user && isMounted) {
            setUser(body.user);
            try {
              localStorage.setItem('si_gpib_cached_user', JSON.stringify(body.user));
            } catch {}
            setIsLoading(false);
            return;
          }
        }
      } catch {}

      // 2. Fallback to supabase.auth.getUser()
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user && isMounted) {
          setUser(data.user);
          try {
            localStorage.setItem('si_gpib_cached_user', JSON.stringify(data.user));
          } catch {}
          setIsLoading(false);
          return;
        }
      } catch {}

      // 3. Resilient Offline Fallback: Membaca profil user dari localStorage
      try {
        const cached = localStorage.getItem('si_gpib_cached_user');
        if (cached && isMounted) {
          setUser(JSON.parse(cached));
          setIsLoading(false);
          return;
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
          try {
            localStorage.setItem('si_gpib_cached_user', JSON.stringify(session.user));
          } catch {}
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
  if (
    role === 'kmj' &&
    (email.toLowerCase().includes('benbianco') ||
      nama.toLowerCase().includes('ben bianco'))
  ) {
    role = 'pj';
  }

  const avatarUrl =
    user?.avatar_url ||
    user?.foto_url ||
    metadata.avatar_url ||
    metadata.foto_url ||
    metadata.picture;

  const logout = async () => {
    try {
      localStorage.removeItem('si_gpib_cached_user');
      localStorage.removeItem('si_gpib_cached_current_user');
      localStorage.removeItem('sigpib_active_context');
      sessionStorage.clear();
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
    } catch {
      // Ignore errors if offline
    } finally {
      document.cookie = 'si_gpib_user_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'sigpib_active_context=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.replace('/api/auth/logout');
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
