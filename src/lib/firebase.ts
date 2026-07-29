import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase is explicitly disconnected for standalone local sandbox mode
export const isFirebaseActive = false;
export const db = null;
export const storage = null;
