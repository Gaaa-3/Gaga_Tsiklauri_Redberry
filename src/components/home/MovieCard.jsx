import { Link } from 'react-router-dom'
import { AgeBadge } from '../ui/AgeBadge'

/** A Now Playing card: 290px wide with a 262x333 poster inset by 14px, all
 *  measured off the Figma export. The whole card is a link to the film, and the
 *  "Buy Ticket" pill inside it goes to the same place — it is there because the
 *  design draws it, not because it does something different. */
export function MovieCard({ movie }) {
  const genre = movie.genres?.[0]?.name

  return (
    <Link
      to={`/movies/${movie.slug}`}
      className="group flex w-[290px] shrink-0 flex-col rounded-2xl bg-surface p-3.5 transition-colors hover:bg-surface-raised"
    >
      <div className="overflow-hidden rounded-xl">
        <img
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          loading="lazy"
          className="h-[333px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-4 truncate text-base font-bold">{movie.title}</h3>

      <p className="mt-1 truncate text-xs text-ink-muted">
        {[genre, `${movie.runtimeMinutes} min`].filter(Boolean).join(' · ')}
      </p>

      <AgeBadge rating={movie.ageRating} className="mt-3 self-start" />

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-ink-muted">
          From <span className="font-semibold text-ink">₾ {movie.fromPrice}</span>
        </span>
        <span className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-xs font-semibold transition-opacity group-hover:opacity-90">
          Buy Ticket
        </span>
      </div>
    </Link>
  )
}
