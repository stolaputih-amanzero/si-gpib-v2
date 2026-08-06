// src/lib/logger.ts
/**
 * Centralized logger utility for SI GPIB.
 * In production, this should integrate with Sentry or Datadog.
 * Rules.md: Ensure all client/server logs route through this.
 */

type LogContext = Record<string, unknown>;

class Logger {
  info(message: string, context?: LogContext) {
    console.log(`[INFO] ${message}`, context || '');
    // Sentry.captureMessage(message, { level: 'info', extra: context });
  }

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '');
    // Sentry.captureMessage(message, { level: 'warning', extra: context });
  }

  error(message: string, context?: LogContext | Error | unknown) {
    console.error(`[ERROR] ${message}`, context || '');
    
    if (context instanceof Error) {
      // Sentry.captureException(context);
    } else {
      // Sentry.captureMessage(message, { level: 'error', extra: context });
    }
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }
}

export const logger = new Logger();
