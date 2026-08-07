import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  server: {
    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    // Sentry (Optional)
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
  },
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    // App
    NEXT_PUBLIC_APP_URL: z.string().url(),
    // Sentry (Optional)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    // Feature Flags
    NEXT_PUBLIC_ENABLE_PUBLIC_PORTAL: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
  },
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_ENABLE_PUBLIC_PORTAL: process.env.NEXT_PUBLIC_ENABLE_PUBLIC_PORTAL,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
});
