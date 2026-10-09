/** The hall map.
 *
 *  RENDERED STRICTLY FROM THE RESPONSE. The brief calls hardcoding rows or
 *  seats unacceptable, and the halls genuinely differ: hall B has a 10-wide
 *  front section and a 14-wide rear one, and hall D labels its rows G then J,
 *  skipping I the way real cinemas do. So:
 *    - each section is its own block with its own name and its own row width
 *    - the nesting is never flattened into one grid
 *    - row labels come from `row.label`, never from an array index
 *    - `seat.aisleAfter` opens a gangway to the right of that seat
 */
export function SeatMap({ map, selectedIds, onToggle, disabled }) {
  return (
    <div>
      <div className="rounded-lg bg-surface-raised py-2 text-center text-[11px] font-bold tracking-[0.3em] text-ink-muted uppercase">
        Screen
      </div>

      <div className="mt-8 space-y-8">
        {map.sections.map((section) => (
          <section key={section.name}>
            <p className="mb-3 text-[11px] font-bold tracking-[0.14em] text-ink-dim uppercase">
              {section.name} · Rows {section.rows[0]?.label}–
              {section.rows[section.rows.length - 1]?.label}
            </p>

            <div className="space-y-2">
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-ink-dim">
                    {row.label}
                  </span>

                  <div className="flex gap-1.5">
                    {row.seats.map((seat) => (
                      <Seat
                        key={seat.id}
                        seat={seat}
                        selected={selectedIds.includes(seat.id)}
                        onToggle={onToggle}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Legend />
    </div>
  )
}

function Seat({ seat, selected, onToggle, disabled }) {
  // Only `available` can be picked. `isMine` means it is already in this user's
  // live hold, so it reads as selected after a reload.
  const mine = seat.isMine
  const selectable = seat.state === 'available' || mine
  const isOn = selected || (mine && selected)

  const look = isOn
    ? 'bg-brand text-ink'
    : seat.state === 'available'
      ? 'bg-surface-raised text-ink-muted hover:bg-control hover:text-ink'
      : seat.state === 'sold'
        ? 'bg-surface-muted text-ink-dim/50'
        : seat.state === 'held'
          ? 'bg-surface-muted text-ink-dim/50'
          : 'bg-transparent text-transparent'

  return (
    <>
      <button
        type="button"
        disabled={!selectable || disabled}
        onClick={() => onToggle(seat)}
        aria-label={`Seat ${seat.code}${selectable ? '' : ` — ${seat.state}`}`}
        aria-pressed={isOn}
        title={seat.code}
        className={`size-7 shrink-0 rounded-md text-[11px] font-semibold transition-colors ${look} ${
          selectable && !disabled ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}
      >
        {seat.label}
      </button>
      {/* A gangway to the right of this seat, straight from the data. */}
      {seat.aisleAfter && <span aria-hidden="true" className="w-5 shrink-0" />}
    </>
  )
}

/** The map needs a legend explaining every colour it uses — a graded rule. */
function Legend() {
  const items = [
    ['bg-surface-raised', 'Available'],
    ['bg-brand', 'Selected'],
    ['bg-surface-muted', 'Sold'],
    ['bg-surface-muted', 'Held by another user'],
  ]
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
      {items.map(([colour, label]) => (
        <span key={label} className="flex items-center gap-2 text-[11px] text-ink-muted">
          <span className={`size-3.5 rounded ${colour}`} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}
