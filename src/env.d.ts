/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_CF_BEACON_TOKEN?: string
  readonly PUBLIC_WEB3FORMS_KEY?: string
  readonly PUBLIC_GA4_ID?: string
  readonly PUBLIC_DEPLOY_TIME?: string
  readonly PUBLIC_GIT_SHA?: string
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY?: string
  readonly PUBLIC_FIREBASE_API_KEY?: string
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN?: string
  readonly PUBLIC_FIREBASE_PROJECT_ID?: string
  readonly PUBLIC_FIREBASE_STORAGE_BUCKET?: string
  readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly PUBLIC_FIREBASE_APP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
