import { AgeBadge } from '../ui/AgeBadge'

/** Seats below this show the count in brand red rather than green — the design
 *  uses colour to mean "hurry". */
const LOW_SEATS = 10

/** One showtime. A sold-out session is rendered DISABLED, not hidden and not
 *  removed: the brief wants the user to see that the 16:30 exists and is gone,
 *  rather than wonder why there is a hole in the schedule. */
export function SessionCard({ session, onSelect }) {
  const soldOut = session.isSoldOut

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onSelect(session)}
      aria-label={`${session.time} at ${session.venue.name}, hall ${session.hall.name}${
        soldOut ? ' — sold out' : ''
      }`}
      className={`flex w-[220px] shrink-0 flex-col rounded-xl border p-4 text-left transition-colors ${
        soldOut
          ? 'cursor-not-allowed border-line/40 bg-surface-muted opacity-50'
          : 'border-line bg-surface hover:border-brand/60 hover:bg-surface-raised'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xl font-extrabold">{session.time}</span>
        <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-bold">
          {session.format.name}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-ink-muted">{session.language.name}</span>
        {soldOut ? (
          <span className="shrink-0 text-[11px] font-semibold text-ink-dim">Sold out</span>
        ) : (
          <span
            className={`flex shrink-0 items-center gap-1 text-[11px] font-semibold ${
              session.seatsLeft <= LOW_SEATS ? 'text-brand' : 'text-available'
            }`}
          >
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {session.seatsLeft} left
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-2 border-t border-line/50 pt-3">
        <span className="truncate text-[11px] font-semibold">
          {session.venue.name} · Hall {session.hall.name}
        </span>
        <span className="shrink-0 text-sm font-bold">₾{session.price}</span>
      </div>
    </button>
  )
}

/** One film and all of its showtimes for the chosen day. The list is grouped by
 *  movie, which is also what the pagination counts — 10 films per page, however
 *  many sessions that turns out to be. */
export function MovieSessionGroup({ group, onSelectSession }) {
  const { movie, sessions } = group

  return (
    <section className="border-t border-line/40 py-7 first:border-t-0">
      <div className="flex items-center gap-4">
        <img
          src={movie.posterUrl}
          alt=""
          loading="lazy"
          className="h-[86px] w-[60px] shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold">{movie.title}</h2>
            <AgeBadge rating={movie.ageRating} />
          </div>
          <p className="mt-1 text-xs text-ink-muted">{movie.runtimeMinutes} min</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} onSelect={onSelectSession} />
        ))}
      </div>
    </section>
  )
}
