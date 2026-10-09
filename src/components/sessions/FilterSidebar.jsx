import { useMemo } from 'react'
import { DatePicker } from './DatePicker'

/** The sticky filter rail.
 *
 *  Every option in here comes from GET /filter-options — no venue, format,
 *  language or time band is written into this file. That is a hard requirement:
 *  the catalogue changes server-side and the UI has to follow. */
export function FilterSidebar({ options, filters, toggle, setFilters, clearAll, activeCount }) {
  /** The format list is DYNAMIC. With venues selected, only the formats those
   *  venues actually run are offered — showing MOTION when neither selected
   *  venue has a MOTION screen would guarantee an empty result. */
  const formats = useMemo(() => {
    if (!options) return []
    if (filters.venues.length === 0) return options.formats
    const offered = formatsOffered(options, filters.venues)
    return options.formats.filter((format) => offered.has(format.slug))
  }, [options, filters.venues])

  /** Changing the venues can strand a format: tick MOTION, then tick a venue
   *  with no MOTION screen, and that format would keep filtering everything out
   *  while no longer being visible to untick. So the venue change and the
   *  pruning of now-impossible formats are written to the URL together, as one
   *  history entry. */
  function onToggleVenue(slug) {
    const venues = filters.venues.includes(slug)
      ? filters.venues.filter((item) => item !== slug)
      : [...filters.venues, slug]

    const nextFormats =
      venues.length === 0
        ? filters.formats
        : filters.formats.filter((format) => formatsOffered(options, venues).has(format))

    setFilters({ venues, formats: nextFormats })
  }

  return (
    <aside className="sticky top-28 h-fit w-[356px] shrink-0 rounded-2xl bg-surface p-6">
      <h2 className="text-base font-bold">Filters</h2>

      <Group label="Venue">
        {options.venues.map((venue) => (
          <Check
            key={venue.slug}
            checked={filters.venues.includes(venue.slug)}
            onChange={() => onToggleVenue(venue.slug)}
            label={venue.name}
            hint={venue.city}
          />
        ))}
      </Group>

      <Group label="Date">
        <DatePicker value={filters.date} onChange={(date) => setFilters({ date })} />
      </Group>

      <Group label="Format">
        {formats.map((format) => (
          <Check
            key={format.slug}
            checked={filters.formats.includes(format.slug)}
            onChange={() => toggle('formats', format.slug)}
            label={format.name}
          />
        ))}
        {formats.length === 0 && (
          <p className="text-xs text-ink-dim">No formats at the selected venues.</p>
        )}
      </Group>

      <Group label="Language">
        {options.languages.map((language) => (
          <Check
            key={language.slug}
            checked={filters.languages.includes(language.slug)}
            onChange={() => toggle('languages', language.slug)}
            label={language.name}
          />
        ))}
      </Group>

      <Group label="Time of day">
        {options.timeBands.map((band) => (
          <Check
            key={band.id}
            checked={filters.bands.includes(band.id)}
            onChange={() => toggle('bands', band.id)}
            // The API writes these as "Morning (before 12:00)"; the design shows
            // the name bold and the window beside it in grey.
            label={splitBandLabel(band.label).name}
            hint={splitBandLabel(band.label).window}
          />
        ))}
      </Group>

      <div className="mt-8 border-t border-line/60 pt-5">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="h-10 w-full rounded-full border border-line text-xs font-semibold transition-colors hover:bg-surface-raised"
          >
            Clear filters
          </button>
        )}
        <p className="mt-3 text-center text-xs text-ink-dim">
          {activeCount} {activeCount === 1 ? 'filter' : 'filters'} active
        </p>
      </div>
    </aside>
  )
}

function Group({ label, children }) {
  return (
    <section className="mt-7">
      <h3 className="text-[11px] font-bold tracking-[0.14em] text-ink-dim uppercase">{label}</h3>
      <div className="mt-3 space-y-2.5">{children}</div>
    </section>
  )
}

/** A checkbox styled as the design draws it: a real <input> kept accessible,
 *  with the brand-red box drawn over it, so keyboard and screen readers work
 *  without re-implementing a checkbox. */
function Check({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer absolute size-full cursor-pointer appearance-none rounded border border-line bg-page checked:border-brand checked:bg-brand"
        />
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="pointer-events-none relative size-3 opacity-0 peer-checked:opacity-100"
        >
          <path
            d="M3 8.5 6.5 12 13 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-semibold">{label}</span>
      {hint && <span className="truncate text-xs text-ink-dim">{hint}</span>}
    </label>
  )
}

/** "Morning (before 12:00)" -> { name: "Morning", window: "before 12:00" } */
function splitBandLabel(label) {
  const match = /^(.*?)\s*\((.*)\)\s*$/.exec(label)
  return match ? { name: match[1], window: match[2] } : { name: label, window: null }
}

/** The set of format slugs actually screened by the given venues. */
function formatsOffered(options, venueSlugs) {
  return new Set(
    options.venues
      .filter((venue) => venueSlugs.includes(venue.slug))
      .flatMap((venue) => (venue.formats ?? []).map((format) => format.slug)),
  )
}
