import { isFirebaseActive, db } from './firebase';

export { isFirebaseActive, db };

export const BROADCAST_CHANNEL_NAME = 'zerone_db_channel';
export const STATE_STORAGE_KEY = 'zerone_state';
export const AUTH_STORAGE_KEY = 'zerone_auth_user';

export function getLocalState() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STATE_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local state", e);
    return null;
  }
}

export function saveLocalState(state: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
}
