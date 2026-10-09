import { useQuery } from '@tanstack/react-query'
import { getComingSoon, getFeatured, getNowPlaying } from '../api/movies'

/** The three lists the home page is built from. They are separate queries on
 *  purpose: the hero can render as soon as /featured lands without waiting on
 *  the other two, and a failure in one section does not blank the whole page. */

export function useFeatured() {
  return useQuery({ queryKey: ['movies', 'featured'], queryFn: getFeatured })
}

export function useNowPlaying(limit) {
  return useQuery({
    queryKey: ['movies', 'now-playing', limit ?? null],
    queryFn: () => getNowPlaying(limit),
  })
}

export function useComingSoon(limit) {
  return useQuery({
    queryKey: ['movies', 'coming-soon', limit ?? null],
    queryFn: () => getComingSoon(limit),
  })
}
