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
 *
 *  Sizes are measured off the Figma: a 48x56 tile, 18px apart, 10px between
 *  rows, with a 32px gangway.
 */
export function SeatMap({ map, selectedIds, onToggle, disabled }) {
  return (
    <div>
      <div className="rounded-xl bg-surface-raised py-2.5 text-center text-[11px] font-bold tracking-[0.3em] text-ink-muted uppercase">
        Screen
      </div>

      <div className="mt-8 space-y-8">
        {map.sections.map((section) => (
          <section key={section.name}>
            <p className="mb-4 text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">
              {section.name} · Rows {section.rows[0]?.label}–
              {section.rows[section.rows.length - 1]?.label}
            </p>

            <div className="space-y-2.5">
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span className="w-4 shrink-0 text-center text-sm font-bold">{row.label}</span>

                  <div className="flex gap-[18px]">
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
  const selectable = seat.state === 'available' || seat.isMine
  const isOn = selected

  const look = isOn
    ? 'bg-brand text-ink'
    : seat.state === 'available'
      ? 'border border-line bg-surface text-ink hover:border-brand/60'
      : seat.state === 'held'
        ? 'seat-held border border-line/50 bg-surface-muted text-ink-dim'
        : seat.state === 'sold'
          ? 'bg-surface-muted text-ink-dim'
          : 'invisible'

  return (
    <>
      <button
        type="button"
        disabled={!selectable || disabled}
        onClick={() => onToggle(seat)}
        aria-label={`Seat ${seat.code}${selectable ? '' : ` — ${seat.state}`}`}
        aria-pressed={isOn}
        className={`h-14 w-12 shrink-0 rounded-xl text-sm font-bold transition-colors ${look} ${
          selectable && !disabled ? 'cursor-pointer' : 'cursor-not-allowed'
        }`}
      >
        {seat.label}
      </button>
      {/* A gangway to the right of this seat, straight from the data. */}
      {seat.aisleAfter && <span aria-hidden="true" className="w-8 shrink-0" />}
    </>
  )
}

/** The map needs a legend explaining every colour it uses — a graded rule, and
 *  the reason "held" is hatched rather than being a second shade of grey. */
function Legend() {
  const items = [
    ['border border-line bg-surface', 'Available'],
    ['bg-brand', 'Selected'],
    ['bg-surface-muted', 'Sold'],
    ['seat-held border border-line/50 bg-surface-muted', 'Held by another user'],
  ]
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-7">
      {items.map(([look, label]) => (
        <span key={label} className="flex items-center gap-2 text-xs text-ink-muted">
          <span className={`size-4 rounded ${look}`} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}
