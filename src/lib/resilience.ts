/**
 * Resilience & Reliability Module
 * Implements exponential backoff retry and circuit breaker logic for high availability.
 */

import { logger } from './logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Execute an async operation with exponential backoff retry and full jitter.
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  opName = 'Operation',
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 100;
  const maxDelayMs = options.maxDelayMs ?? 2000;
  const factor = options.factor ?? 2;
  const shouldRetry = options.shouldRetry ?? (() => true);

  let lastError: any;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;

      if (attempt > maxRetries || !shouldRetry(err)) {
        logger.error(`[Resilience] ${opName} failed permanently after ${attempt} attempt(s)`, { error: err.message });
        throw err;
      }

      // Calculate exponential backoff with full jitter
      const jitteredDelay = Math.floor(Math.random() * Math.min(maxDelayMs, delay));
      logger.warn(`[Resilience] ${opName} failed (attempt ${attempt}/${maxRetries}). Retrying in ${jitteredDelay}ms...`, {
        error: err.message,
      });

      await new Promise((resolve) => setTimeout(resolve, jitteredDelay));
      delay *= factor;
    }
  }

  throw lastError;
}

/**
 * Simple Circuit Breaker to prevent cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeoutMs = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>, fallbackFn?: () => T): Promise<T> {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        logger.info('[CircuitBreaker] Transitioned from OPEN to HALF_OPEN');
      } else {
        logger.warn('[CircuitBreaker] Circuit is OPEN. Executing fallback.');
        if (fallbackFn) return fallbackFn();
        throw new Error('Service temporarily unavailable due to high error rates. Please try again shortly.');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      return result;
    } catch (err: any) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        logger.error('[CircuitBreaker] Failure threshold reached. Circuit is now OPEN.', { failures: this.failures });
      }

      if (fallbackFn) {
        return fallbackFn();
      }
      throw err;
    }
  }

  private reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    logger.info('[CircuitBreaker] Reset to CLOSED state');
  }

  getStatus() {
    return { state: this.state, failures: this.failures };
  }
}
