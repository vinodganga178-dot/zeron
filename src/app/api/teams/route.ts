import { NextRequest } from 'next/server';
import { dbStore } from '@/lib/db-service';
import { parsePaginationParams } from '@/lib/validation';
import { ok, fail, withPublic } from '@/lib/with-auth';

export const GET = withPublic(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const pagination = parsePaginationParams(url);
    const status = url.searchParams.get('status') || undefined;

    const result = await dbStore.paginateTeams({
      page: pagination.page,
      limit: pagination.limit,
      search: pagination.search,
      sortBy: pagination.sortBy || 'totalScore',
      order: pagination.order,
      status,
    });

    return ok(result);
  } catch (err: any) {
    return fail(err.message || 'Failed to fetch teams', 500);
  }
});
