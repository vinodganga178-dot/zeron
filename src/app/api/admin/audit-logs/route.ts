import { NextRequest } from 'next/server';
import { withAuth, ok, fail } from '@/lib/with-auth';
import { getAuditLogs } from '@/lib/audit-logger';
import { parsePaginationParams } from '@/lib/validation';

export const GET = withAuth(['admin'], async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const pagination = parsePaginationParams(url);
    const type = url.searchParams.get('type') || undefined;

    const logs = getAuditLogs(pagination.page, pagination.limit, pagination.search, type);
    return ok(logs);
  } catch (err: any) {
    return fail(err.message || 'Failed to fetch audit logs', 500);
  }
});
