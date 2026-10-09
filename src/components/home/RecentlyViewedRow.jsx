import { Link } from 'react-router-dom'
import { AgeBadge } from '../ui/AgeBadge'

/** The small cards between the hero and Now Playing. Shown to guests too — the
 *  list comes from localStorage, not from the account.
 *
 *  It takes the films it should show plus the stored order, and renders them in
 *  that order: most recently opened first. Slugs that no longer match a film
 *  (removed from the catalogue) simply do not appear. */
export function RecentlyViewedRow({ slugs, moviesBySlug }) {
  const movies = slugs.map((slug) => moviesBySlug.get(slug)).filter(Boolean)

  if (movies.length === 0) return null

  return (
    <section className="mx-auto w-content px-rail py-10">
      <h2 className="text-xl font-extrabold">Recently viewed</h2>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/movies/${movie.slug}`}
            className="flex w-[290px] shrink-0 items-center gap-3 rounded-2xl bg-surface p-3 transition-colors hover:bg-surface-raised"
          >
            <img
              src={movie.posterUrl}
              alt=""
              loading="lazy"
              className="size-14 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold tracking-wide uppercase">{movie.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                {[movie.genres?.[0]?.name, `${movie.runtimeMinutes} min`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <AgeBadge rating={movie.ageRating} className="mt-1.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
