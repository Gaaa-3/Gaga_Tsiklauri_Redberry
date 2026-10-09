/** The three home-page lists plus one film's detail and showtimes.
 *  Every movie route takes the SLUG. A numeric id 404s. */
import { requestData } from '../lib/http'

/** Carries `synopsis`. */

export function getNowPlaying(limit) {
  return requestData('/movies/now-playing', { query: { limit } })
}

/** No sessions exist for these, so nothing here may lead to seat selection. */

export function getComingSoon(limit) {
  return requestData('/movies/coming-soon', { query: { limit } })
}

/** The hero carousel — a subset of Now Playing, and bookable. */

export function getFeatured() {
  return requestData('/movies/featured')
}

export function getMovie(slug) {
  return requestData(`/movies/${slug}`)
}

/** Grouped by venue, for the chosen day of the 7-day picker. */

export function getMovieSessions(slug, date) {
  return requestData(`/movies/${slug}/sessions`, { query: { date } })
}

/** "Notify Me" on a Coming Soon film. Idempotent — pressing it twice is fine. */

export function notifyMe(slug) {
  return requestData(`/movies/${slug}/notify`, {
    method: 'POST',
  })
}
