import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { notifyMe } from '../../api/movies'
import { useAuth } from '../../auth/useAuth'
import { ApiError } from '../../lib/http'
import { AgeBadge } from '../ui/AgeBadge'

/** A Coming Soon card: 525px wide, poster left, details right.
 *
 *  These films have NO sessions, so nothing on this card may lead towards seat
 *  selection — it links to the film's page and offers "Notify Me", and that is
 *  all. That is a rule from the brief, not a styling choice.
 *
 *  The card is deliberately NOT one big link: "Notify Me" is a real button, and
 *  a button inside an anchor is invalid HTML that keyboard and screen-reader
 *  users trip over. The poster and the title carry the link instead. */
export function ComingSoonCard({ movie }) {
  const { status, openLogin } = useAuth()
  const queryClient = useQueryClient()

  const notify = useMutation({
    mutationFn: () => notifyMe(movie.slug),
    onSuccess: () => {
      // Render from the server rather than flipping a local flag.
      queryClient.invalidateQueries({ queryKey: ['movies', 'coming-soon'] })
    },
  })

  const notified = movie.isNotified || notify.isSuccess

  function onNotify() {
    if (status !== 'authed') {
      // A guest gets the login modal. Replaying the click afterwards is the
      // pending-action work, which lands with the next slice.
      openLogin()
      return
    }
    if (notified || notify.isPending) return
    notify.mutate()
  }

  return (
    <article className="group flex w-[525px] shrink-0 gap-4 rounded-2xl bg-surface p-3.5 transition-colors hover:bg-surface-raised">
      <Link to={`/movies/${movie.slug}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
        <img
          src={movie.posterUrl}
          alt=""
          loading="lazy"
          className="h-[150px] w-[200px] rounded-xl object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-col py-1">
        <p className="truncate text-[11px] font-bold tracking-[0.12em] text-brand uppercase">
          In cinemas {releaseLabel(movie.releaseDate)}
        </p>

        <h3 className="mt-2 truncate text-base font-bold">
          <Link to={`/movies/${movie.slug}`} className="hover:underline">
            {movie.title}
          </Link>
        </h3>

        <p className="mt-1 truncate text-xs text-ink-muted">
          {[movie.genres?.[0]?.name, `${movie.runtimeMinutes} min`].filter(Boolean).join(' · ')}
        </p>

        <AgeBadge rating={movie.ageRating} className="mt-2 self-start" />

        <button
          type="button"
          onClick={onNotify}
          disabled={notify.isPending || notified}
          className="mt-auto inline-flex h-9 w-fit items-center gap-2 rounded-full bg-surface-raised px-4 text-xs font-semibold transition-colors hover:bg-control disabled:cursor-default disabled:opacity-70"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5">
            <path
              d="M18 15v-4a6 6 0 1 0-12 0v4l-1.5 3h15L18 15ZM10 21h4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span aria-live="polite">
            {notified ? 'We’ll notify you' : notify.isPending ? 'Saving…' : 'Notify Me'}
          </span>
        </button>

        {notify.isError && (
          <p role="alert" className="mt-1.5 text-[11px] text-brand">
            {notify.error instanceof ApiError ? notify.error.message : 'Could not save that.'}
          </p>
        )}
      </div>
    </article>
  )
}

/** "2 October" — the date the film reaches cinemas. */
function releaseLabel(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'soon'
  return `${date.getDate()} ${date.toLocaleString('en-GB', { month: 'long' })}`
}
