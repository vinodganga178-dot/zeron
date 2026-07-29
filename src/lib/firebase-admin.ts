/**
 * Firebase Admin SDK — server-side only singleton.
 * Safely handles disconnected backend mode without throwing unhandled exceptions.
 */

export function getAdminApp() {
  return null;
}

export function getAdminDb() {
  return null;
}

/** True when Firebase Admin is configured */
export const isAdminConfigured = (): boolean => {
  return false;
};
