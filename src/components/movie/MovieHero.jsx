import { AgeBadge } from '../ui/AgeBadge'

/** Backdrop, poster and the headline facts. The navbar floats over this, so the
 *  content is pushed clear of it rather than the hero starting below it. */
export function MovieHero({ movie }) {
  return (
    <section className="relative h-[630px] w-full overflow-hidden">
      <img src={movie.backdropUrl} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-page via-page/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-page to-transparent" />

      <div className="relative mx-auto flex h-full w-content items-center gap-10 px-page pt-navbar">
        <img
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          className="h-[400px] w-[280px] shrink-0 rounded-2xl object-cover shadow-2xl shadow-black/50"
        />

        <div className="max-w-[640px]">
          <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">{movie.kind}</p>

          <h1 className="mt-3 text-5xl font-extrabold uppercase">{movie.title}</h1>

          {movie.synopsis && (
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">{movie.synopsis}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AgeBadge rating={movie.ageRating} />
            <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-surface/80 px-2 text-xs font-semibold text-ink-muted">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 7v5l3 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {movie.runtimeMinutes} Min
            </span>
            {movie.formats?.map((format) => (
              <span
                key={format.id}
                className="inline-flex h-6 items-center rounded-md bg-surface-raised px-2 text-xs font-bold"
              >
                {format.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
