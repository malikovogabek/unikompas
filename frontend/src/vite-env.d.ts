/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base, e.g. https://unikompas-api.onrender.com/api/v1 (defaults to /api/v1 via the dev proxy). */
  readonly VITE_API_BASE_URL?: string
  /** "true" shows the demo login under the sign-in form (public portfolio deployment). */
  readonly VITE_SHOW_DEMO_HINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
