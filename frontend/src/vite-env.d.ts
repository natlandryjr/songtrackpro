/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_SPOTIFY_CLIENT_ID: string
  readonly VITE_META_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}