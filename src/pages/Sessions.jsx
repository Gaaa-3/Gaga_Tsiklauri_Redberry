import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { BookingModal } from '../components/booking/BookingModal'
import { FilterSidebar } from '../components/sessions/FilterSidebar'
import { Pagination } from '../components/sessions/Pagination'
import { MovieSessionGroup } from '../components/sessions/SessionCard'
import { SessionGroupSkeleton, SidebarSkeleton } from '../components/sessions/SessionSkeletons'
import { SortSelect } from '../components/sessions/SortSelect'
import { ErrorRetry } from '../components/ui/ErrorRetry'
import { useFilterOptions } from '../hooks/useFilterOptions'
import { useSessionFilters } from '../hooks/useSessionFilters'
import { useSessions } from '../hooks/useSessions'
import { ApiError } from '../lib/http'

/** Showtimes across every venue, with the filter rail on the left.
 *
 *  All of the state — filters, sort and page — lives in the URL, so this page
 *  holds none of its own. See useSessionFilters for why. */
export function SessionsPage() {
  const { filters, setFilters, toggle, clearAll, activeCount } = useSessionFilters()
  const options = useFilterOptions()
  const sessions = useSessions(filters)
  const { requireAuth } = useAuth()
  const [selectedSession, setSelectedSession] = useState(null)

  const groups = sessions.data?.data ?? []
  const meta = sessions.data?.meta

  /** Picking a showtime needs an account, so it goes through requireAuth: a
   *  guest gets the login modal, and the selection then applies by itself
   *  afterwards without them clicking twice.
   *
   *  The booking modal arrives with the seat-map slice; until then this records
   *  which showtime was chosen, which is what that modal will open on. */
  function onSelectSession(session, movie) {
    requireAuth(() => setSelectedSession({ session, movie }))
  }

  return (
    <div className="mx-auto w-content px-rail pt-navbar pb-20">
      <header className="mt-10">
        <h1 className="text-3xl font-extrabold">Sessions</h1>
        <p className="mt-2 text-sm text-ink-muted">Browse showtimes across all venues</p>
      </header>

      <div className="mt-8 flex gap-8">
        {options.isPending && <SidebarSkeleton />}

        {options.isError && (
          <aside className="w-[290px] shrink-0">
            <ErrorRetry
              message={message(options.error)}
              onRetry={() => void options.refetch()}
              retrying={options.isFetching}
            />
          </aside>
        )}

        {options.data && (
          <FilterSidebar
            options={options.data}
            filters={filters}
            toggle={toggle}
            setFilters={setFilters}
            clearAll={clearAll}
            activeCount={activeCount}
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink-muted" aria-live="polite">
              {sessions.isPending
                ? 'Loading sessions…'
                : meta?.totalSessions
                  ? `Showing ${meta.totalSessions} ${meta.totalSessions === 1 ? 'session' : 'sessions'}`
                  : 'No sessions found'}
            </p>

            {options.data && (
              <SortSelect
                sorts={options.data.sorts}
                value={filters.sort}
                onChange={(sort) => setFilters({ sort })}
              />
            )}
          </div>

          <div className="mt-2">
            {sessions.isPending &&
              Array.from({ length: 4 }, (_, i) => <SessionGroupSkeleton key={i} />)}

            {sessions.isError && (
              <div className="mt-6">
                <ErrorRetry
                  message={message(sessions.error)}
                  onRetry={() => void sessions.refetch()}
                  retrying={sessions.isFetching}
                />
              </div>
            )}

            {sessions.data && groups.length === 0 && (
              <div className="mt-6 rounded-2xl bg-surface p-10 text-center">
                <p className="font-semibold">No sessions match these filters</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Try another date, or widen the venues and formats.
                </p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-5 h-11 rounded-full bg-brand px-6 text-sm font-semibold transition-opacity hover:opacity-90"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {groups.length > 0 && (
              // Dimmed while a new page or filter is in flight: the old results
              // stay readable instead of the page collapsing to skeletons again.
              <div className={sessions.isFetching ? 'opacity-60 transition-opacity' : undefined}>
                {groups.map((group) => (
                  <MovieSessionGroup
                    key={group.movie.id}
                    group={group}
                    onSelectSession={onSelectSession}
                  />
                ))}
              </div>
            )}
          </div>

          {meta && (
            <Pagination
              currentPage={meta.currentPage}
              lastPage={meta.lastPage}
              onChange={(page) => {
                setFilters({ page })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          )}
        </div>
      </div>

      {selectedSession && (
        <BookingModal
          session={selectedSession.session}
          movie={selectedSession.movie}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}

function message(error) {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}
