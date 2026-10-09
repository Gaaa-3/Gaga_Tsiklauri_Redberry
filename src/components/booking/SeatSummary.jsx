/** The right-hand panel on step 1: one row per chosen seat with its own ticket
 *  type, and a subtotal that updates as you go.
 *
 *  Ticket types and their price ratios come from /filter-options — Adult 1.00,
 *  Student 0.75, Child 0.60 are never written down here, and the percentages on
 *  the pills are derived from the ratio rather than typed. Child carries
 *  `blockedFromRatingAge: 16`, so it is hidden entirely on a 16+ or 18+ title
 *  rather than offered and then refused. */
export function SeatSummary({
  seats,
  ticketTypes,
  ticketTypeBySeat,
  onChangeTicketType,
  onRemoveSeat,
  basePrice,
  maxSeats,
  movieMinAge,
}) {
  const allowedTypes = ticketTypes.filter(
    (type) => type.blockedFromRatingAge == null || movieMinAge < type.blockedFromRatingAge,
  )

  const priceFor = (seatId) => {
    const slug = ticketTypeBySeat[seatId] ?? 'adult'
    const type = ticketTypes.find((item) => item.slug === slug)
    return Math.round(basePrice * (type?.priceRatio ?? 1) * 100) / 100
  }

  const subtotal = seats.reduce((sum, seat) => sum + priceFor(seat.id), 0)

  return (
    <div className="flex h-full flex-col">
      <h3 className="text-sm font-bold">Your seats · Max {maxSeats}</h3>
      <p className="mt-1.5 text-xs text-ink-muted">
        Pick up to {maxSeats} seats from the map. Each seat can carry its own ticket type.
      </p>

      <div className="mt-5 flex-1 space-y-3 overflow-y-auto">
        {seats.map((seat) => {
          const slug = ticketTypeBySeat[seat.id] ?? 'adult'
          const note = allowedTypes.find((type) => type.slug === slug)?.note

          return (
            <div key={seat.id} className="rounded-xl bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">Seat {seat.code}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold">₾{priceFor(seat.id)}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveSeat(seat)}
                    aria-label={`Remove seat ${seat.code}`}
                    className="flex size-5 items-center justify-center rounded text-ink-dim transition-colors hover:bg-surface-raised hover:text-ink"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </span>
              </div>

              {/* Pills rather than a dropdown, as drawn: all the options and
                  their prices are visible without opening anything. */}
              <div className="mt-2.5 flex gap-1.5">
                {allowedTypes.map((type) => {
                  const active = type.slug === slug
                  return (
                    <button
                      key={type.slug}
                      type="button"
                      onClick={() => onChangeTicketType(seat.id, type.slug)}
                      aria-pressed={active}
                      title={type.note ?? undefined}
                      className={`flex-1 rounded-md px-1.5 py-1.5 text-[10px] font-bold whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-brand text-ink'
                          : 'bg-surface-raised text-ink-muted hover:text-ink'
                      }`}
                    >
                      {type.name} {Math.round(type.priceRatio * 100)}%
                    </button>
                  )
                })}
              </div>

              {note && <p className="mt-1.5 text-[11px] text-ink-dim">{note}</p>}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-4">
        <span className="text-[11px] font-bold tracking-[0.14em] text-ink-dim uppercase">
          Subtotal
        </span>
        <span className="text-xl font-extrabold">₾{Math.round(subtotal * 100) / 100}</span>
      </div>
    </div>
  )
}
