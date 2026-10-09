import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchMovies } from '../../api/reference'
import { useDebounced } from '../../hooks/useDebounced'

/** The header typeahead. Three states, all drawn in the design: a prompt while
 *  the box is empty, the results list, and a no-results panel.
 *
 *  The query is debounced so a request does not leave on every keystroke, and
 *  the list is keyboard navigable — arrows to move, Enter to open, Escape to
 *  dismiss — because a dropdown that only works with a mouse is half built. */
export function SearchBox() {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const listId = useId()

  const debounced = useDebounced(term.trim(), 250)

  const search = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchMovies(debounced),
    enabled: open && debounced.length > 0,
    staleTime: 30_000,
  })

  const results = debounced.length > 0 ? (search.data ?? []) : []

  // Clicking anywhere else closes the panel.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function choose(movie) {
    setOpen(false)
    setTerm('')
    navigate(`/movies/${movie.slug}`)
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((i) => (i + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((i) => (i - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(results[Math.min(highlighted, results.length - 1)])
    }
  }

  return (
    <div ref={rootRef} className="relative w-[420px]">
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-dim"
      >
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12.8 12.8 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={term}
        placeholder="Search films and live events"
        aria-label="Search films and live events"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setTerm(event.target.value)
          setHighlighted(0)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-full bg-surface pr-10 pl-11 text-sm text-ink outline-none placeholder:text-ink-dim"
      />

      {term && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setTerm('')
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-surface-raised text-ink-muted transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {open && (
        <div
          id={listId}
          className="absolute top-[calc(100%+10px)] right-0 left-0 overflow-hidden rounded-2xl bg-page shadow-2xl shadow-black/60"
        >
          {debounced.length === 0 ? (
            <EmptyPanel
              icon="popcorn"
              title="What do you want to watch?"
              hint="Search by title, director or cast"
              onBrowse={() => setOpen(false)}
            />
          ) : search.isPending ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyPanel
              icon="search"
              title={`No results for “${debounced}”`}
              hint="Check the spelling or try another film or live event."
              onBrowse={() => setOpen(false)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <p className="text-[11px] font-bold tracking-[0.14em] text-ink-dim uppercase">
                  Films &amp; events
                </p>
                <p className="text-xs text-ink-dim">
                  {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
              </div>

              <ul role="listbox" className="pb-3">
                {results.map((movie, i) => (
                  <li key={movie.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === highlighted}
                      onMouseEnter={() => setHighlighted(i)}
                      onClick={() => choose(movie)}
                      className={`flex w-full items-center gap-4 px-5 py-2.5 text-left transition-colors ${
                        i === highlighted ? 'bg-surface' : ''
                      }`}
                    >
                      <img
                        src={movie.posterUrl}
                        alt=""
                        loading="lazy"
                        className="h-[62px] w-[46px] shrink-0 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          <Highlight text={movie.title} term={debounced} />
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-ink-muted">
                          {[capitalise(movie.kind), movie.ageRating?.code, `${movie.runtimeMinutes} min`]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold">
                        {movie.isComingSoon ? (
                          <span className="text-warning">Coming Soon</span>
                        ) : (
                          <span>from ₾{movie.fromPrice}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyPanel({ icon, title, hint, onBrowse }) {
  return (
    <div className="px-6 py-10 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface text-ink">
        {icon === 'popcorn' ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
            <path
              d="M6 9h12l-1.2 11H7.2L6 9Zm1-1a2.5 2.5 0 0 1 2.2-3.5A2.6 2.6 0 0 1 12 3a2.6 2.6 0 0 1 2.8 1.5A2.5 2.5 0 0 1 17 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12.8 12.8 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </span>

      <p className="mt-4 text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{hint}</p>

      <Link
        to="/sessions"
        onClick={onBrowse}
        className="mt-5 inline-flex h-11 items-center rounded-full bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-raised"
      >
        Browse all sessions
      </Link>
    </div>
  )
}

/** Picks the matched part of a title out in full white, the rest muted, so the
 *  reason a row matched is visible at a glance. */
function Highlight({ text, term }) {
  const at = text.toLowerCase().indexOf(term.toLowerCase())
  if (at < 0 || term.length === 0) return text

  return (
    <>
      <span className="text-ink-muted">{text.slice(0, at)}</span>
      {text.slice(at, at + term.length)}
      <span className="text-ink-muted">{text.slice(at + term.length)}</span>
    </>
  )
}

function capitalise(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : value
}
