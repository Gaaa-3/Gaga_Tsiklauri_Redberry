import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { DetailsPanel } from '../components/movie/DetailsPanel'
import { MovieHero } from '../components/movie/MovieHero'
import { VenueSessions } from '../components/movie/VenueSessions'
import { DatePicker } from '../components/sessions/DatePicker'
import { ErrorRetry } from '../components/ui/ErrorRetry'
import { useMovie, useMovieSessions } from '../hooks/useMovie'
import { notifyRecentlyViewedChanged } from '../hooks/useRecentlyViewed'
import { today } from '../hooks/useSessionFilters'
import { ApiError } from '../lib/http'
import { pushRecentlyViewed } from '../lib/recentlyViewed'

export function MovieDetailPage() {
  const { slug } = useParams()
  const { user, requireAuth } = useAuth()

  const [chosenDate, setChosenDate] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)

  const movie = useMovie(slug)

  // Not every film plays today — availableDates can start tomorrow. Until the
  // user picks a day, land on today when it has showtimes and on the first day
  // that does otherwise, so nobody arrives on an empty, disabled date.
  // Derived rather than set from an effect, so there is no extra render and no
  // request fired against a date we are about to abandon.
  const availableDates = movie.data?.availableDates
  const date =
    chosenDate ??
    (availableDates ? (availableDates.includes(today()) ? today() : availableDates[0]) : null)

  const sessions = useMovieSessions(slug, date)

  // Opening a film is what puts it in "Recently viewed" on the home page — for
  // guests as well as signed-in users.
  useEffect(() => {
    if (!slug) return
    pushRecentlyViewed(slug)
    notifyRecentlyViewedChanged()
  }, [slug])

  if (movie.isPending) return <MovieDetailSkeleton />

  if (movie.isError) {
    return (
      <div className="mx-auto w-content px-rail pt-48 pb-20">
        <ErrorRetry
          message={movie.error instanceof ApiError ? movie.error.message : 'Could not load the film.'}
          onRetry={() => void movie.refetch()}
          retrying={movie.isFetching}
        />
      </div>
    )
  }

  const film = movie.data

  /** The age gate. `user.age` is derived server-side, so no date maths happens
   *  here. A guest is never blocked — they have no age yet, and the check
   *  happens again once they log in. */
  const minAge = film.ageRating?.minAge ?? 0
  const blocked = Boolean(user && user.age != null && minAge > 0 && user.age < minAge)
  const blockedMessage = `This film is rated ${film.ageRating?.code}. You cannot buy tickets for it with this account.`

  function onSelectSession(session) {
    requireAuth(() => setSelectedSession(session))
  }

  return (
    <>
      <MovieHero movie={film} />

      <div className="mx-auto flex w-content gap-10 px-rail pt-10 pb-20">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold">Sessions</h2>

          <div className="mt-5">
            <DatePicker
              value={date}
              onChange={setChosenDate}
              availableDates={film.availableDates}
              size="lg"
            />
          </div>

          {selectedSession && (
            <p className="mt-5 rounded-xl bg-surface px-4 py-3 text-sm text-ink-muted">
              Selected <span className="font-semibold text-ink">{selectedSession.time}</span> at{' '}
              <span className="font-semibold text-ink">{selectedSession.venue.name}</span>, Hall{' '}
              {selectedSession.hall.name}. Seat selection opens here next.
            </p>
          )}

          {sessions.isPending && (
            <div className="mt-6 flex gap-4">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="h-[136px] w-[340px] animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
          )}

          {sessions.isError && (
            <div className="mt-6">
              <ErrorRetry
                message={
                  sessions.error instanceof ApiError
                    ? sessions.error.message
                    : 'Could not load showtimes.'
                }
                onRetry={() => void sessions.refetch()}
                retrying={sessions.isFetching}
              />
            </div>
          )}

          {sessions.data && (
            <VenueSessions
              groups={sessions.data}
              blocked={blocked}
              blockedMessage={blockedMessage}
              onSelect={onSelectSession}
            />
          )}
        </div>

        <DetailsPanel movie={film} />
      </div>
    </>
  )
}

function MovieDetailSkeleton() {
  return (
    <>
      <div className="h-[630px] w-full animate-pulse bg-surface-muted">
        <div className="mx-auto flex h-full w-content items-center gap-10 px-rail pt-navbar">
          <div className="h-[400px] w-[280px] shrink-0 rounded-2xl bg-surface" />
          <div className="flex-1">
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="mt-4 h-12 w-[460px] rounded bg-surface" />
            <div className="mt-5 h-16 w-[600px] rounded bg-surface" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-content gap-10 px-rail pt-10 pb-20">
        <div className="flex-1 animate-pulse">
          <div className="h-6 w-32 rounded bg-surface" />
          <div className="mt-5 h-16 w-[520px] rounded bg-surface" />
          <div className="mt-6 h-[136px] w-[340px] rounded-2xl bg-surface" />
        </div>
        <div className="h-[420px] w-[360px] shrink-0 animate-pulse rounded-2xl bg-surface" />
      </div>
    </>
  )
}
