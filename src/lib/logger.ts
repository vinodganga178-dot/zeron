/**
 * Production Centralized Structured Logger
 * Safe logging with automatic redaction of sensitive credentials and PII.
 */

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

export interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'jwt',
  'secret',
  'authorization',
  'cookie',
  'privateKey',
  'credential',
  'ssn',
]);

function sanitizeValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) {
    return '[REDACTED]';
  }
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === 'object' ? sanitizeObject(item) : item));
    }
    return sanitizeObject(value as Record<string, unknown>);
  }
  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    sanitized[k] = sanitizeValue(k, v);
  }
  return sanitized;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown) {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? sanitizeObject(context) : undefined;
  
  let errorDetails: { error?: string; stack?: string } = {};
  if (err instanceof Error) {
    errorDetails = { error: err.message, stack: err.stack };
  } else if (typeof err === 'string') {
    errorDetails = { error: err };
  }

  const payload: LogPayload = {
    level,
    message,
    timestamp,
    ...(sanitizedContext ? { context: sanitizedContext } : {}),
    ...errorDetails,
  };

  const jsonLine = JSON.stringify(payload);

  switch (level) {
    case 'ERROR':
      console.error(jsonLine);
      break;
    case 'WARN':
      console.warn(jsonLine);
      break;
    case 'AUDIT':
    case 'INFO':
    default:
      console.log(jsonLine);
      break;
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log('INFO', message, context),
  warn: (message: string, context?: Record<string, unknown>, err?: unknown) => log('WARN', message, context, err),
  error: (message: string, context?: Record<string, unknown>, err?: unknown) => log('ERROR', message, context, err),
  audit: (message: string, context?: Record<string, unknown>) => log('AUDIT', message, context),
};
