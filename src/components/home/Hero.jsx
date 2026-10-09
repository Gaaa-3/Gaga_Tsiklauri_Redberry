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
  // Paused only while the pointer is over the control strip itself, so a click
  // on an arrow is not stolen by the slide changing underneath it. Pausing on
  // the whole hero was wrong: it is 800px tall and fills most of the window, so
  // a cursor resting anywhere over it froze the carousel indefinitely.
  const [paused, setPaused] = useState(false)

  const count = movies.length

  const go = useCallback((next) => setIndex(((next % count) + count) % count), [count])

  // The progress bar and the advance are driven by one animation frame loop
  // rather than by a CSS animation plus a separate timer. Two clocks drift —
  // and pausing would desynchronise them — whereas this way the red line
  // reaching the end of its segment *is* what advances the slide.
  const fillRef = useRef(null)
  const pausedRef = useRef(paused)
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  const goRef = useRef(go)
  useEffect(() => {
    goRef.current = go
  }, [go])

  useEffect(() => {
    if (count < 2) return

    let frame
    let elapsed = 0
    let last = null

    function tick(now) {
      if (last === null) last = now
      // Clamped because requestAnimationFrame stops firing in a hidden tab:
      // without this, coming back after a minute would bank the whole gap at
      // once and flick straight past a slide.
      const delta = Math.min(now - last, 100)
      last = now

      if (!pausedRef.current) elapsed += delta

      const progress = Math.min(elapsed / SLIDE_MS, 1)
      // Written straight to the DOM: this runs ~60 times a second and must not
      // re-render the hero each frame.
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`

      if (progress >= 1) {
        goRef.current(index + 1)
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // Restarting on `index` is the point: each slide gets a fresh, full bar.
  }, [index, count])

  if (count === 0) return null

  const movie = movies[index]

  return (
    <section
      className="relative h-[800px] w-full overflow-hidden"
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
        <div
          className="absolute inset-x-0 bottom-10 mx-auto flex w-content items-center gap-6 px-rail"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* One segment per film. The current one's red line grows from left to
              right over the slide's 7 seconds; reaching the end is what moves
              the carousel on. The rest stay as hairlines. */}
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
                <span className="block h-0.5 w-full overflow-hidden rounded-full bg-ink/25 transition-colors group-hover:bg-ink/40">
                  {i === index && (
                    <span
                      ref={fillRef}
                      // The starting scale is set inline, not with Tailwind's
                      // `scale-x-0`: that compiles to the standalone `scale`
                      // property, which applies *on top of* the `transform`
                      // this bar is animated with, pinning it to zero width.
                      style={{ transform: 'scaleX(0)' }}
                      className="block h-full w-full origin-left rounded-full bg-brand"
                    />
                  )}
                </span>
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
