/**
 * API Request Payload Validation Utilities
 * Lightweight, zero-dependency input validation preventing invalid or malicious inputs.
 */

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

/** Sanitize text against common injection attacks */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Basic HTML tag strip
    .slice(0, 500); // Length cap to prevent ReDoS / memory buffer attacks
}

/** Validate Email format */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 100;
}

/** Validate Score Submission Payload */
export interface ScoreSubmissionPayload {
  eventId: 'quiz' | 'pitch' | 'sell' | 'treasureHunt';
  marks: number;
}

export function validateScorePayload(body: any): ValidationResult<ScoreSubmissionPayload> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object.' };
  }

  const validEvents = ['quiz', 'pitch', 'sell', 'treasureHunt'];
  if (!body.eventId || !validEvents.includes(body.eventId)) {
    return { valid: false, error: `Invalid eventId. Must be one of: ${validEvents.join(', ')}` };
  }

  const numMarks = Number(body.marks);
  if (isNaN(numMarks) || numMarks < -100 || numMarks > 500) {
    return { valid: false, error: 'Marks must be a valid number between -100 and 500.' };
  }

  return {
    valid: true,
    data: {
      eventId: body.eventId,
      marks: numMarks,
    },
  };
}

/** Validate Pagination Parameters */
export interface PaginationParams {
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  order: 'asc' | 'desc';
}

export function parsePaginationParams(url: URL): PaginationParams {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const search = sanitizeString(url.searchParams.get('search') || '');
  const sortBy = sanitizeString(url.searchParams.get('sortBy') || '');
  const order = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  return { page, limit, search, sortBy, order };
}
