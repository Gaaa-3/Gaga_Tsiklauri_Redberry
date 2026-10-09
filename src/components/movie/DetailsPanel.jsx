/** The right-hand facts card, ending with the rating note.
 *
 *  The rating note is the API's own `ageRating.description` — it is written for
 *  the user ("Restricted to viewers aged 16 and over. Child tickets are
 *  unavailable.") so it is shown word for word rather than reworded here. */
export function DetailsPanel({ movie }) {
  return (
    <aside className="h-fit w-[360px] shrink-0 rounded-2xl bg-surface p-6">
      <h2 className="text-base font-bold">Details</h2>

      <dl className="mt-5 space-y-5">
        <Fact label="Director" value={movie.director} />
        <Fact label="Main cast" value={movie.cast} />
        <Fact label="Duration" value={`${movie.runtimeMinutes} minutes`} />
        <Fact label="Release date" value={formatDate(movie.releaseDate)} />
        <Fact
          label="Formats"
          value={movie.formats?.map((format) => format.name).join(', ') || null}
        />
        <Fact label="From" value={`₾${movie.fromPrice}`} />
      </dl>

      {movie.ageRating && (
        <div className="mt-6 rounded-xl bg-brand/10 p-4">
          <p className="text-[11px] font-bold tracking-[0.12em] text-ink-dim uppercase">
            Rating note
          </p>
          <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
            <span className="shrink-0 font-bold text-brand">{movie.ageRating.code}</span>
            <span>{movie.ageRating.description}</span>
          </p>
        </div>
      )}
    </aside>
  )
}

function Fact({ label, value }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-[0.12em] text-ink-dim uppercase">{label}</dt>
      <dd className="mt-1.5 text-sm font-semibold">{value}</dd>
    </div>
  )
}

/** "4 September 2026" */
function formatDate(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
