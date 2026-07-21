'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  user: User | null;
  email: string;
  nama: string;
  role: string;
  avatarUrl?: string;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export function useUser(): UserProfile {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const email = user?.email || 'Tamu (Belum Login)';
  const metadata = user?.user_metadata || {};
  const nama =
    metadata.nama_lengkap ||
    metadata.full_name ||
    metadata.name ||
    (user?.email ? user.email.split('@')[0] : 'Pelayan Pos Pelkes');
  const role = metadata.role || 'Pengurus Pos Pelkes / Presbiter';
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
