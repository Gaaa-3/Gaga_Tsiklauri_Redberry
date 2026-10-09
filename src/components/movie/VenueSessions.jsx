/** Seats below this show in brand red rather than green. */
const LOW_SEATS = 10

/** The showtimes for the chosen day, grouped by venue and then by hall — the
 *  API groups by venue, the hall split happens here because the design draws
 *  one card per hall.
 *
 *  `blocked` is the age gate. When the signed-in account is too young for the
 *  rating, every showtime renders disabled with the reason stated once. Guests
 *  are never blocked: they have no age yet, so the check happens after login. */
export function VenueSessions({ groups, blocked, blockedMessage, onSelect }) {
  if (groups.length === 0) {
    return (
      <div className="mt-6 rounded-2xl bg-surface p-10 text-center">
        <p className="font-semibold">No showtimes on this day</p>
        <p className="mt-1 text-sm text-ink-muted">Pick another date from the week above.</p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {blocked && (
        <p role="alert" className="mb-5 rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">
          {blockedMessage}
        </p>
      )}

      <div className="space-y-7">
        {groups.map((group) => (
          <section key={group.venue.id}>
            <h3 className="text-sm font-bold">{group.venue.name}</h3>

            <div className="mt-3 flex flex-wrap gap-4">
              {byHall(group.sessions).map(([hallId, hall, sessions]) => (
                <div key={hallId} className="rounded-2xl bg-surface p-4">
                  <p className="text-[11px] font-semibold text-ink-dim">Hall {hall.name}</p>

                  <div className="mt-3 flex gap-3">
                    {sessions.map((session) => (
                      <SessionTile
                        key={session.id}
                        session={session}
                        blocked={blocked}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function SessionTile({ session, blocked, onSelect }) {
  const unavailable = blocked || session.isSoldOut

  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={() => onSelect(session)}
      className={`w-[150px] rounded-xl border p-3 text-left transition-colors ${
        unavailable
          ? 'cursor-not-allowed border-line/40 bg-surface-muted opacity-50'
          : 'border-line bg-page hover:border-brand/60'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-extrabold">{session.time}</span>
        <span className="text-sm font-bold text-brand">₾{session.price}</span>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-bold">
          {session.language.code ?? session.language.name}
        </span>
        <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-bold">
          {session.format.name}
        </span>
      </div>

      <p className="mt-2 text-[11px] font-semibold">
        {session.isSoldOut ? (
          <span className="text-ink-dim">Sold out</span>
        ) : (
          <span className={session.seatsLeft <= LOW_SEATS ? 'text-brand' : 'text-available'}>
            {session.seatsLeft} left
          </span>
        )}
      </p>
    </button>
  )
}

/** [[hallId, hall, sessions], …] in the order the halls first appear. */
function byHall(sessions) {
  const halls = new Map()
  for (const session of sessions) {
    const existing = halls.get(session.hall.id)
    if (existing) existing[2].push(session)
    else halls.set(session.hall.id, [session.hall.id, session.hall, [session]])
  }
  return [...halls.values()]
}
