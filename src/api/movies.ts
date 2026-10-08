/** The three home-page lists plus one film's detail and showtimes.
 *  Every movie route takes the SLUG. A numeric id 404s. */

import { requestData } from '../lib/http'
import type { Movie, MovieDetail, VenueSessionGroup } from '../types/api'

/** Carries `synopsis`. */
export function getNowPlaying(limit?: number) {
  return requestData<Movie[]>('/movies/now-playing', { query: { limit } })
}

/** No sessions exist for these, so nothing here may lead to seat selection. */
export function getComingSoon(limit?: number) {
  return requestData<Movie[]>('/movies/coming-soon', { query: { limit } })
}

/** The hero carousel — a subset of Now Playing, and bookable. */
export function getFeatured() {
  return requestData<Movie[]>('/movies/featured')
}

export function getMovie(slug: string) {
  return requestData<MovieDetail>(`/movies/${slug}`)
}

/** Grouped by venue, for the chosen day of the 7-day picker. */
export function getMovieSessions(slug: string, date?: string) {
  return requestData<VenueSessionGroup[]>(`/movies/${slug}/sessions`, { query: { date } })
}

/** "Notify Me" on a Coming Soon film. Idempotent — pressing it twice is fine. */
export function notifyMe(slug: string) {
  return requestData<{ movieId: number; subscribed: boolean }>(`/movies/${slug}/notify`, {
    method: 'POST',
  })
}
