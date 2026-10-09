import { useQuery } from '@tanstack/react-query'
import { getMovie, getMovieSessions } from '../api/movies'

/** One film's full record: synopsis, director, cast, and `availableDates` —
 *  the days that actually have showtimes, which drives the day picker. */
export function useMovie(slug) {
  return useQuery({
    queryKey: ['movie', slug],
    queryFn: () => getMovie(slug),
    enabled: Boolean(slug),
  })
}

/** That film's showtimes for one day, already grouped by venue by the API. */
export function useMovieSessions(slug, date) {
  return useQuery({
    queryKey: ['movie', slug, 'sessions', date],
    queryFn: () => getMovieSessions(slug, date),
    enabled: Boolean(slug && date),
  })
}
