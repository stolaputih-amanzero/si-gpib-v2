'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginCallback() {
  const router = useRouter();

  useEffect(() => {
    // Initialize the Supabase browser client
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // The browser client automatically intercepts the #access_token hash fragment,
    // establishes the local session, and sets the auth cookies.
    const establishSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        // Session successfully established, redirect to dashboard
        router.push('/dashboard');
        router.refresh(); // Force refresh to ensure server components see the new cookies
      } else {
        console.error('Session not found in callback', error);
        router.push('/login');
      }
    };

    establishSession();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-muted text-sm animate-pulse">Memverifikasi sesi aman...</p>
      </div>
    </div>
  );
}
