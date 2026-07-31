/**
 * Centralized Environment Configuration & Secret Management
 * Enforces production reliability: zero hardcoded secrets in production mode.
 */

export interface AppEnvConfig {
  nodeEnv: 'development' | 'production' | 'test';
  jwtSecret: string;
  isProduction: boolean;
  cacheTtlMs: number;
  rateLimitMaxTokens: number;
  firebaseProjectId?: string;
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;
}

let cachedEnv: AppEnvConfig | null = null;

export function getEnvConfig(): AppEnvConfig {
  if (cachedEnv) return cachedEnv;

  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const isProduction = nodeEnv === 'production';

  const jwtSecret = process.env.JWT_SECRET;
  
  if (isProduction && (!jwtSecret || jwtSecret.length < 32)) {
    throw new Error(
      '[CRITICAL ERROR] JWT_SECRET environment variable is missing or less than 32 characters in production mode!'
    );
  }

  const effectiveJwtSecret = jwtSecret || 'zerone-dev-secret-key-32-chars-minimum-for-local-sandbox-environment';

  cachedEnv = {
    nodeEnv,
    jwtSecret: effectiveJwtSecret,
    isProduction,
    cacheTtlMs: Number(process.env.CACHE_TTL_MS) || 5000,
    rateLimitMaxTokens: Number(process.env.RATE_LIMIT_MAX_TOKENS) || 60,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined,
  };

  return cachedEnv;
}

/** Reset cached env (useful during tests or config changes) */
export function resetEnvConfig(): void {
  cachedEnv = null;
}
