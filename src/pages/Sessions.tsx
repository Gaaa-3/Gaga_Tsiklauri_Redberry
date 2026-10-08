import { Page } from '../components/layout/Page'
import { useFilterOptions } from '../hooks/useFilterOptions'

/** Placeholder that proves the API client end to end: it fetches the real
 *  /filter-options and shows the three states every screen in this app needs —
 *  loading, failed-with-a-retry, and loaded. The filter sidebar and the grouped
 *  session list replace this in a later commit. */
export function SessionsPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useFilterOptions()

  return (
    <Page title="Sessions" subtitle="Browse showtimes across all venues">
      {isPending && <p className="text-ink-muted">Loading venues…</p>}

      {isError && (
        <div className="space-y-4">
          <p className="text-brand">{error.message}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="h-11 rounded-full bg-surface px-6 text-sm font-semibold disabled:opacity-50"
          >
            {isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      )}

      {data && (
        <div className="w-[356px] rounded-2xl bg-surface p-8">
          <h2 className="text-xl font-bold">Venues</h2>
          <ul className="mt-5 space-y-3">
            {data.venues.map((venue) => (
              <li key={venue.id} className="text-sm font-semibold">
                {venue.name} <span className="text-ink-muted">· {venue.city}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-line pt-5 text-xs text-ink-dim">
            Up to {data.maxSeatsPerOrder} seats per order · held for {data.holdMinutes} minutes
          </p>
        </div>
      )}
    </Page>
  )
}
