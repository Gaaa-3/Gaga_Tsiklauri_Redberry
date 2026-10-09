/** The five sort options come from filter-options.sorts — the list is not
 *  written here. A native <select> is deliberate: it is keyboard accessible and
 *  screen-reader correct for free, and the design's chevron is drawn over it. */
export function SortSelect({ sorts, value, onChange }) {
  const current = value || sorts[0]?.id || ''

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-muted">Sort:</span>
      <span className="relative">
        <select
          value={current}
          onChange={(event) => onChange(event.target.value)}
          className="appearance-none rounded-lg bg-surface py-2 pr-9 pl-3 text-sm font-semibold outline-none hover:bg-surface-raised"
        >
          {sorts.map((sort) => (
            <option key={sort.id} value={sort.id}>
              {sort.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
        >
          <path
            d="m6 9 6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  )
}
