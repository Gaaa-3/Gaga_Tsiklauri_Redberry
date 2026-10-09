/** The auth token lives in localStorage so a refresh keeps you signed in.
 *  Every access is wrapped because localStorage throws in private browsing. */

const STORAGE_KEY = 'kinoxii.token'

export function readToken() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // Storage disabled — behave like a guest.
    return null
  }
}

export function writeToken(token) {
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // Storage disabled — the session just won't survive a refresh.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
