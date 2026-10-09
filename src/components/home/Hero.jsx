import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AgeBadge } from '../ui/AgeBadge'

/** How long each featured film holds before the carousel advances. */
const SLIDE_MS = 7000

/** The full-bleed hero: the backdrop of one featured film at a time, with the
 *  navbar floating over it. Height is 800px, measured off the Figma export.
 *
 *  Slides crossfade rather than slide sideways, which keeps the text readable
 *  throughout and costs one opacity transition instead of a layout animation. */
export function Hero({ movies }) {
  const [index, setIndex] = useState(0)
  // Paused while the pointer is over the hero, so a user reading the synopsis
  // does not have it yanked away mid-sentence.
  const [paused, setPaused] = useState(false)

  const count = movies.length

  const go = useCallback(
    (next) => setIndex(((next % count) + count) % count),
    [count],
  )

  // Restarting this timer on every index change is deliberate: clicking an
  // arrow should give you a fresh 7 seconds, not the tail of the old interval.
  const goRef = useRef(go)
  useEffect(() => {
    goRef.current = go
  }, [go])

  useEffect(() => {
    if (paused || count < 2) return
    const timer = setTimeout(() => goRef.current(index + 1), SLIDE_MS)
    return () => clearTimeout(timer)
  }, [index, paused, count])

  if (count === 0) return null

  const movie = movies[index]

  return (
    <section
      className="relative h-[800px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured films"
    >
      {movies.map((item, i) => (
        <img
          key={item.id}
          src={item.backdropUrl}
          alt=""
          aria-hidden={i !== index}
          // Only the first is eager: the rest are off-screen until they are not.
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Two gradients: one down the left so the copy stays legible over a busy
          frame, one up from the bottom so the hero melts into the page. */}
      <div className="absolute inset-0 bg-gradient-to-r from-page via-page/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-page to-transparent" />

      <div className="relative mx-auto flex h-full w-content flex-col justify-end px-rail pb-28">
        <div className="max-w-[620px]">
          <p className="text-xs font-bold tracking-[0.18em] text-brand uppercase">
            Premiere · {releaseWeek(movie.releaseDate)}
          </p>

          <h1 className="mt-4 text-hero font-extrabold uppercase">{movie.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <AgeBadge rating={movie.ageRating} />
            <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-surface/80 px-2 text-xs font-semibold text-ink-muted">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

          {movie.synopsis && (
            <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-ink-muted">
              {movie.synopsis}
            </p>
          )}

          <div className="mt-7 flex items-center gap-3">
            <Link
              to={`/movies/${movie.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
                <path
                  d="M3 9.5V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.5a2.5 2.5 0 0 0 0-5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              Buy tickets
            </Link>
            <Link
              to="/sessions"
              className="inline-flex h-11 items-center rounded-full bg-surface px-6 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              All sessions
            </Link>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-10 mx-auto flex w-content items-center gap-6 px-rail">
          {/* One segment per film. The active one fills brand red; the rest are
              hairlines. Clicking a segment jumps straight to that film. */}
          <div className="flex flex-1 gap-2">
            {movies.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${item.title}`}
                aria-current={i === index}
                className="group h-3 flex-1"
              >
                <span
                  className={`block h-0.5 w-full rounded-full transition-colors ${
                    i === index ? 'bg-brand' : 'bg-ink/30 group-hover:bg-ink/60'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex shrink-0 gap-3">
            <CarouselArrow label="Previous film" onClick={() => go(index - 1)} direction="left" />
            <CarouselArrow label="Next film" onClick={() => go(index + 1)} direction="right" />
          </div>
        </div>
      )}
    </section>
  )
}

function CarouselArrow({ label, onClick, direction }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors hover:bg-ink/10"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path
          d={direction === 'left' ? 'M15 5 8 12l7 7' : 'm9 5 7 7-7 7'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

/** "WEEK OF 18 SEPT", the strapline above the hero title. */
function releaseWeek(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'now showing'
  return `week of ${date.getDate()} ${date.toLocaleString('en-GB', { month: 'short' })}`
}
