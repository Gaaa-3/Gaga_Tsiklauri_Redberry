/** Reference data and the header typeahead. */

import { requestData } from '../lib/http'
import type { FilterOptions, Movie } from '../types/api'

/** Fetched once at boot and cached. Venues, formats, languages, time bands,
 *  sorts, ticket types, age ratings, the 3-seat cap and the 8-minute hold all
 *  come from here — none of it is hardcoded anywhere in the app. */
export function getFilterOptions() {
  return requestData<FilterOptions>('/filter-options')
}

/** Max 6 matches. A blank query comes back as an empty list, so there is no
 *  need to guard the call. */
export function searchMovies(query: string) {
  return requestData<Movie[]>('/search', { query: { q: query } })
}
