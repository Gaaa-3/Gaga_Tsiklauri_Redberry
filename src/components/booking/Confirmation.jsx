import { Link } from 'react-router-dom'

/** Rendered from the order the API returned, never from what we sent it —
 *  the reference, the per-ticket prices and the total are all the server's. */
export function Confirmation({ order, onClose }) {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-available/15 text-available">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7">
          <path
            d="m5 13 4 4L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <h3 className="mt-5 text-2xl font-extrabold">You’re booked</h3>
      <p className="mt-1.5 text-sm text-ink-muted">
        Booking reference <span className="font-bold text-ink">{order.reference}</span>
      </p>

      <div className="mt-6 rounded-2xl bg-surface p-5 text-left">
        <p className="text-sm font-bold">{order.session.movie.title}</p>
        <p className="mt-1 text-xs text-ink-muted">
          {order.session.venue.name} · Hall {order.session.hall.name} · {order.session.date} ·{' '}
          {order.session.time}
        </p>

        <ul className="mt-4 space-y-2 border-t border-line/60 pt-4">
          {order.tickets.map((ticket) => (
            <li key={ticket.id} className="flex items-center justify-between text-xs">
              <span className="font-semibold">
                Seat {ticket.seatCode}
                <span className="ml-2 font-normal text-ink-muted">
                  {ticket.ticketType?.name}
                </span>
              </span>
              <span className="font-semibold">₾{ticket.price}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-4">
          <span className="text-xs text-ink-muted">
            Paid with card ending {order.cardLastFour}
          </span>
          <span className="text-lg font-extrabold">₾{order.totalPrice}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/profile?tab=tickets"
          onClick={onClose}
          className="flex h-11 flex-1 items-center justify-center rounded-full bg-brand text-sm font-semibold transition-opacity hover:opacity-90"
        >
          My tickets
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="h-11 flex-1 rounded-full bg-surface text-sm font-semibold transition-colors hover:bg-surface-raised"
        >
          Close
        </button>
      </div>
    </div>
  )
}
