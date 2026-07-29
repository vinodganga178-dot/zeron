import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { withAuth, withPublic, ok, fail } from '@/lib/with-auth';
import { Notification } from '@/types';

/** GET /api/notifications — returns notifications for the current user */
export const GET = withPublic(async (req) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'global';
  const groupNumber = searchParams.get('groupNumber');
  const role = searchParams.get('role');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  const db = getAdminDb();

  // Fetch global + role + group + personal notifications
  const targets = ['global'];
  if (role) targets.push(role);
  if (groupNumber) targets.push(groupNumber);
  if (userId && userId !== 'global') targets.push(userId);

  const snap = await db.collection('notifications')
    .where('userId', 'in', targets.slice(0, 10)) // Firestore 'in' limit is 10
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  const notifications = snap.docs.map(d => d.data() as Notification);
  return ok({ notifications, total: notifications.length });
});

/** POST /api/notifications — broadcast notification (admin/volunteer) */
export const POST = withAuth(['admin', 'volunteer'], async (req, session) => {
  const body = await req.json().catch(() => null);
  if (!body) return fail('Invalid JSON body');

  const { title, body: msgBody, userId } = body as {
    title?: string; body?: string; userId?: string;
  };

  if (!title?.trim() || !msgBody?.trim()) return fail('title and body are required.');

  const db = getAdminDb();
  const now = new Date().toISOString();
  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const notification: Notification = {
    id,
    userId: userId || 'global',
    title: title.trim(),
    body: msgBody.trim(),
    timestamp: now,
    read: false,
  };

  await db.collection('notifications').doc(id).set(notification);

  await db.collection('auditLogs').add({
    type: 'admin',
    message: `Broadcast "${title}" to "${userId || 'global'}" by ${session.role} ${session.name}`,
    timestamp: now,
  });

  return ok(notification, 'Notification broadcast successfully.');
});
