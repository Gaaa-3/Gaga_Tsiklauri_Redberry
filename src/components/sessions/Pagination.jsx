/** Pagination over FILMS, not sessions: `lastPage` counts movies, 10 to a page,
 *  so one page can easily hold forty showtimes. */
export function Pagination({ currentPage, lastPage, onChange }) {
  if (lastPage <= 1) return null

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <Arrow
        label="Previous page"
        direction="left"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
      />

      {pageItems(currentPage, lastPage).map((item, i) =>
        item === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-ink-dim">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === currentPage ? 'page' : undefined}
            className={`size-9 rounded-full text-sm font-semibold transition-colors ${
              item === currentPage ? 'bg-brand text-ink' : 'text-ink-muted hover:bg-surface'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <Arrow
        label="Next page"
        direction="right"
        disabled={currentPage >= lastPage}
        onClick={() => onChange(currentPage + 1)}
      />
    </nav>
  )
}

function Arrow({ label, direction, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
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

/** First page, last page, the neighbours of the current one, and an ellipsis
 *  where numbers were skipped — "1 2 [3] … 10" as drawn. */
function pageItems(current, last) {
  const pages = new Set([1, last, current, current - 1, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b)

  const items = []
  let previous = 0
  for (const page of sorted) {
    if (page - previous > 1) items.push('…')
    items.push(page)
    previous = page
  }
  return items
}
