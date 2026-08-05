/*
 * Firestore init — shared oriz-in Firebase project, Firestore ONLY.
 * Clerk owns auth; Firebase is data storage keyed by Clerk user id.
 * All config from import.meta.env (PUBLIC_FIREBASE_*), never hardcoded.
 * Returns null when config is absent so the site builds + runs without keys.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
}

let db: Firestore | null = null

export function getDb(): Firestore | null {
  if (db) return db
  if (!cfg.apiKey || !cfg.projectId) return null
  const app: FirebaseApp = getApps()[0] ?? initializeApp(cfg)
  db = getFirestore(app)
  return db
}
