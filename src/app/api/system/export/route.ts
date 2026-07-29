import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { withAuth } from '@/lib/with-auth';

/** GET /api/system/export
 * Exports full platform state as a downloadable zerone_backup.json
 * Includes: students, volunteers, groups, events, scores, notifications, auditLogs, systemSettings
 */
export const GET = withAuth(['admin'], async () => {
  const db = getAdminDb();

  const [
    studentsSnap,
    volunteersSnap,
    groupsSnap,
    eventsSnap,
    scoresSnap,
    notificationsSnap,
    logsSnap,
    settingsDoc,
  ] = await Promise.all([
    db.collection('students').get(),
    db.collection('volunteers').get(),
    db.collection('groups').get(),
    db.collection('events').orderBy('stageOrder', 'asc').get(),
    db.collection('scores').get(),
    db.collection('notifications').orderBy('timestamp', 'desc').get(),
    db.collection('auditLogs').orderBy('timestamp', 'desc').limit(500).get(),
    db.collection('systemSettings').doc('main').get(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    platform: 'IEEE Zerone',
    students: studentsSnap.docs.map(d => d.data()),
    volunteers: volunteersSnap.docs.map(d => d.data()),
    groups: groupsSnap.docs.map(d => d.data()),
    events: eventsSnap.docs.map(d => d.data()),
    scores: scoresSnap.docs.map(d => d.data()),
    notifications: notificationsSnap.docs.map(d => d.data()),
    auditLogs: logsSnap.docs.map(d => d.data()),
    systemSettings: settingsDoc.exists ? settingsDoc.data() : {},
  };

  const json = JSON.stringify(backup, null, 2);
  const timestamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="zerone_backup_${timestamp}.json"`,
      'Cache-Control': 'no-store',
    },
  });
});
