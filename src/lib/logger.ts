import * as Sentry from '@sentry/nextjs';

type LogContext = Record<string, unknown>;

class Logger {
  info(message: string, context?: LogContext) {
    console.log(`[INFO] ${message}`, context || '');
    if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
      Sentry.addBreadcrumb({ category: 'app', message, data: context, level: 'info' });
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '');
    if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
      Sentry.addBreadcrumb({ category: 'app', message, data: context, level: 'warning' });
    }
  }

  error(message: string, context?: LogContext | Error | unknown) {
    console.error(`[ERROR] ${message}`, context || '');
    
    if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
      if (context instanceof Error) {
        Sentry.captureException(context, { extra: { customMessage: message } });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: typeof context === 'object' ? (context as LogContext) : { details: context },
        });
      }
    }
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }
}

export const logger = new Logger();
