import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getSessions } from '../api/sessions'

/** The sessions list for the current filters.
 *
 *  `keepPreviousData` is what stops the page flashing empty every time a
 *  checkbox is ticked: the previous results stay on screen, dimmed by the
 *  caller, while the new ones load. */
export function useSessions(filters) {
  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: () =>
      getSessions({
        date: filters.date,
        venues: filters.venues,
        formats: filters.formats,
        languages: filters.languages,
        bands: filters.bands,
        sort: filters.sort || undefined,
        page: filters.page > 1 ? filters.page : undefined,
      }),
    placeholderData: keepPreviousData,
  })
}
