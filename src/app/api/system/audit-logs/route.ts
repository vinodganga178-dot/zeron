import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { withAuth, ok } from '@/lib/with-auth';
import { AuditLog } from '@/types';

/** GET /api/system/audit-logs
 * Returns paginated audit logs, newest first.
 * Query params: ?limit=50&before=<timestamp>
 */
export const GET = withAuth(['admin'], async (req) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const before = searchParams.get('before'); // cursor: ISO timestamp

  const db = getAdminDb();

  let query = db.collection('auditLogs').orderBy('timestamp', 'desc');

  if (before) {
    query = query.startAfter(before);
  }

  const snap = await query.limit(limit).get();
  const logs = snap.docs.map(d => d.data() as AuditLog);

  const cursor = logs.length > 0 ? logs[logs.length - 1].timestamp : null;

  return ok({
    logs,
    cursor,
    hasMore: logs.length === limit,
    total: logs.length,
  });
});
