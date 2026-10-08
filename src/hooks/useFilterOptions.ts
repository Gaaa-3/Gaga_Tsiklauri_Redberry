import { useQuery } from '@tanstack/react-query'
import { getFilterOptions } from '../api/reference'

/** /filter-options is reference data: it is fetched once and then reused from
 *  the cache everywhere, which is why it never goes stale. Anything that needs
 *  a venue, format, language, time band, sort, ticket type or age rating reads
 *  it from here instead of holding its own copy. */
export function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: getFilterOptions,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
