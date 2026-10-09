/** The right-hand panel on step 1: one row per chosen seat with its own ticket
 *  type, and a subtotal that updates as you go.
 *
 *  Ticket types and their price ratios come from /filter-options — Adult 1.00,
 *  Student 0.75, Child 0.60 are never written down here. Child carries
 *  `blockedFromRatingAge: 16`, so it is hidden entirely on a 16+ or 18+ title
 *  rather than offered and then refused. */
export function SeatSummary({
  seats,
  ticketTypes,
  ticketTypeBySeat,
  onChangeTicketType,
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
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold">{seat.code}</span>
                <span className="text-sm font-bold">₾{priceFor(seat.id)}</span>
              </div>

              <select
                value={slug}
                onChange={(event) => onChangeTicketType(seat.id, event.target.value)}
                aria-label={`Ticket type for seat ${seat.code}`}
                className="mt-2 w-full rounded-lg bg-surface-raised px-2 py-1.5 text-xs font-semibold outline-none"
              >
                {allowedTypes.map((type) => (
                  <option key={type.slug} value={type.slug}>
                    {type.name}
                  </option>
                ))}
              </select>

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
