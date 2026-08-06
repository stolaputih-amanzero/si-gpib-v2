import * as Sentry from '@sentry/nextjs';
import { env } from '@/lib/env';

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    if (env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, context);
    } else {
      Sentry.addBreadcrumb({ message, data: context, level: 'info' });
    }
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    if (env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      if (error instanceof Error) {
        Sentry.captureException(error, { contexts: { info: context } });
      } else {
        Sentry.captureMessage(message, { contexts: { info: context }, level: 'error' });
      }
    }
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    if (env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, context);
    } else {
      Sentry.addBreadcrumb({ message, data: context, level: 'warning' });
    }
  },
};
