import { useMemo } from 'react'
import { today } from '../../hooks/useSessionFilters'

/** The horizontal picker over the NEXT 7 DAYS, today first and selected by
 *  default. Single select — unlike every other filter here. */
export function DatePicker({ value, onChange }) {
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

  return (
    <div className="flex gap-1.5" role="group" aria-label="Date">
      {days.map((day) => {
        const selected = day.iso === value
        return (
          <button
            key={day.iso}
            type="button"
            onClick={() => onChange(day.iso)}
            aria-pressed={selected}
            className={`flex h-12 flex-1 flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition-colors ${
              selected
                ? 'bg-brand text-ink'
                : 'bg-page text-ink-muted hover:bg-surface-raised hover:text-ink'
            }`}
          >
            <span>{day.weekday}</span>
            <span className="text-xs font-bold">{day.dayOfMonth}</span>
          </button>
        )
      })}
    </div>
  )
}
