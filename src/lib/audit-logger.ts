/**
 * Production Audit Logging Service
 * Records administrative actions, score modifications, and system events for security and compliance.
 */

import { AuditLog } from '@/types';
import { logger } from './logger';
import { generateDefaultState } from './seed';

// In-memory store for fast audit log lookups and sandbox execution
const localAuditLogs: AuditLog[] = generateDefaultState().auditLogs;

export interface AuditLogOptions {
  type: AuditLog['type'];
  message: string;
  userId?: string;
  details?: Record<string, unknown>;
}

export async function recordAuditLog(options: AuditLogOptions): Promise<AuditLog> {
  const logEntry: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: options.type,
    message: options.message,
    timestamp: new Date().toISOString(),
  };

  // 1. Log to structured logger
  logger.audit(`[Audit] ${options.message}`, {
    type: options.type,
    userId: options.userId,
    details: options.details,
  });

  // 2. Persist in memory buffer (capped to latest 10,000 entries)
  localAuditLogs.unshift(logEntry);
  if (localAuditLogs.length > 10000) {
    localAuditLogs.pop();
  }

  return logEntry;
}

export function getAuditLogs(page = 1, limit = 20, search = '', type?: string) {
  let filtered = [...localAuditLogs];

  if (type) {
    filtered = filtered.filter((log) => log.type === type);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (log) => log.message.toLowerCase().includes(q) || log.id.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    logs: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
