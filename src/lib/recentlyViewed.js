/** "Recently viewed" is shown to guests as well as signed-in users, so it lives
 *  in localStorage rather than on the server. Only the slug is stored — the film
 *  itself is re-read from the API, so a title or poster that changes server-side
 *  is never served stale from a visitor's browser.
 *
 *  Every access is wrapped because localStorage throws in private browsing. */

const STORAGE_KEY = 'kinoxii.recentlyViewed'

/** The design shows a single row of them; more than this is never displayed. */
const LIMIT = 8

/** @returns {string[]} slugs, most recently opened first. */
export function readRecentlyViewed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Anything could be in storage — another tab, an older build, a user
    // editing it by hand — so only keep what is actually a list of strings.
    if (!Array.isArray(parsed)) return []
    return parsed.filter((slug) => typeof slug === 'string').slice(0, LIMIT)
  } catch {
    return []
  }
}

/** Moves `slug` to the front, de-duplicating, and trims to the limit. */
export function pushRecentlyViewed(slug) {
  if (!slug) return readRecentlyViewed()

  const next = [slug, ...readRecentlyViewed().filter((item) => item !== slug)].slice(0, LIMIT)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage disabled — the list just won't survive this page.
  }
  return next
}
