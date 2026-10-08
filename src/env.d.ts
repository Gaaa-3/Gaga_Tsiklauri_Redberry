/// <reference types="vite/client" />

/** Merges into Vite's own ImportMetaEnv so import.meta.env.VITE_API_BASE_URL is typed. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}
