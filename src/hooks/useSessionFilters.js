import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Every filter, the sort and the page live in the URL — not in component state.
 *  That is a hard requirement: pasting the URL into a new tab must restore the
 *  exact view, a refresh must keep the filters, and Back must step through the
 *  filter history. Holding them in useState would break all three.
 *
 *  The URL is therefore the single source of truth, and this hook is the only
 *  place that reads or writes it. */

/** The API's array parameters. `bands` is deliberately not `timeBands`: the
 *  reference data calls them timeBands, the query parameter is bands[]. */
const ARRAY_KEYS = ['venues', 'formats', 'languages', 'bands']

/** Today in the browser's timezone as YYYY-MM-DD — the default date. */
export function today() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function useSessionFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const read = (key) => searchParams.getAll(`${key}[]`)
    return {
      venues: read('venues'),
      formats: read('formats'),
      languages: read('languages'),
      bands: read('bands'),
      date: searchParams.get('date') || today(),
      sort: searchParams.get('sort') || '',
      page: Number(searchParams.get('page')) || 1,
    }
  }, [searchParams])

  /** Writes a patch onto the URL.
   *
   *  Any change other than the page itself resets back to page 1 — without it a
   *  user on page 4 who ticks a filter lands on an empty page 4. */
  const setFilters = useCallback(
    (patch, { replace = false } = {}) => {
      const next = new URLSearchParams(searchParams)

      for (const [key, value] of Object.entries(patch)) {
        if (ARRAY_KEYS.includes(key)) {
          next.delete(`${key}[]`)
          for (const item of value) next.append(`${key}[]`, item)
        } else if (value === null || value === undefined || value === '') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      }

      if (!('page' in patch)) next.delete('page')

      setSearchParams(next, { replace })
    },
    [searchParams, setSearchParams],
  )

  /** Ticking and unticking one checkbox in a multi-select group. */
  const toggle = useCallback(
    (key, value) => {
      const current = searchParams.getAll(`${key}[]`)
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      setFilters({ [key]: next })
    },
    [searchParams, setFilters],
  )

  /** "Clear All Filters" KEEPS THE DATE — clearing the day you are looking at
   *  would be a surprise, and the brief calls this out specifically. */
  const clearAll = useCallback(() => {
    setFilters({ venues: [], formats: [], languages: [], bands: [], sort: '' })
  }, [setFilters])

  /** The number behind "X filters active". The date is excluded: there is
   *  always a date, so counting it would never read zero. */
  const activeCount =
    filters.venues.length + filters.formats.length + filters.languages.length + filters.bands.length

  return { filters, setFilters, toggle, clearAll, activeCount }
}
