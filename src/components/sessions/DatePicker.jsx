import { useMemo } from 'react'
import { today } from '../../hooks/useSessionFilters'

/** The horizontal picker over the NEXT 7 DAYS, today first and selected by
 *  default. Single select — unlike every other filter.
 *
 *  `availableDates`, when given, is the list of days that actually have
 *  showtimes (the movie detail page passes it). Days outside it are rendered
 *  disabled rather than removed, so the week stays a week and the gaps are
 *  visible. Omitted on the sessions page, where every day is selectable. */
export function DatePicker({ value, onChange, availableDates, size = 'sm' }) {
  const days = useMemo(() => {
    const start = new Date(`${today()}T00:00:00`)
    return Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(start)
      date.setDate(start.getDate() + offset)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return {
        iso: `${date.getFullYear()}-${month}-${day}`,
        weekday: date.toLocaleString('en-GB', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
      }
    })
  }, [])

  const allowed = availableDates ? new Set(availableDates) : null
  const large = size === 'lg'

  return (
    <div className={large ? 'flex gap-3' : 'flex gap-1.5'} role="group" aria-label="Date">
      {days.map((day) => {
        const selected = day.iso === value
        const disabled = allowed ? !allowed.has(day.iso) : false

        return (
          <button
            key={day.iso}
            type="button"
            disabled={disabled}
            onClick={() => onChange(day.iso)}
            aria-pressed={selected}
            title={disabled ? 'No showtimes on this day' : undefined}
            className={`flex flex-col items-center justify-center font-semibold transition-colors ${
              large ? 'h-16 w-16 rounded-xl text-xs' : 'h-12 flex-1 rounded-lg text-[11px]'
            } ${
              selected
                ? 'bg-brand text-ink'
                : disabled
                  ? 'cursor-not-allowed bg-surface-muted text-ink-dim opacity-50'
                  : 'bg-page text-ink-muted hover:bg-surface-raised hover:text-ink'
            }`}
          >
            <span>{day.weekday}</span>
            <span className={large ? 'text-base font-bold' : 'text-xs font-bold'}>
              {day.dayOfMonth}
            </span>
          </button>
        )
      })}
    </div>
  )
}
