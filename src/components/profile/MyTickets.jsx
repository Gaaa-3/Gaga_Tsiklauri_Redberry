import { useState } from 'react'
import { useRefund, useTickets } from '../../hooks/useTickets'
import { ApiError } from '../../lib/http'
import { ErrorRetry } from '../ui/ErrorRetry'

/** Upcoming and past orders, with refunds on the upcoming ones.
 *
 *  The Refund button is driven off the order's own `isRefundable`, never off a
 *  cutoff computed here: the rule is "up to 2 hours before the session", and a
 *  browser clock that is wrong by a few minutes would otherwise offer a button
 *  that fails, or hide one that would have worked. */
export function MyTickets() {
  const [tab, setTab] = useState('upcoming')
  const tickets = useTickets(tab)
  const refund = useRefund()
  const [refundError, setRefundError] = useState(null)

  const orders = tickets.data ?? []

  async function onRefund(order) {
    setRefundError(null)
    try {
      await refund.mutateAsync(order.reference)
    } catch (error) {
      setRefundError(
        error instanceof ApiError ? error.message : 'Could not refund that order just now.',
      )
    }
  }

  return (
    <div>
      <div className="flex gap-2 rounded-full bg-surface p-1 w-fit">
        {['upcoming', 'past'].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-current={tab === value ? 'true' : undefined}
            className={`rounded-full px-6 py-2 text-xs font-bold capitalize transition-colors ${
              tab === value ? 'bg-brand text-ink' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {refundError && (
        <p role="alert" className="mt-5 rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">
          {refundError}
        </p>
      )}

      <div className="mt-6">
        {tickets.isPending &&
          Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="mb-4 h-40 animate-pulse rounded-2xl bg-surface" />
          ))}

        {tickets.isError && (
          <ErrorRetry
            message={
              tickets.error instanceof ApiError
                ? tickets.error.message
                : 'Could not load your tickets.'
            }
            onRetry={() => void tickets.refetch()}
            retrying={tickets.isFetching}
          />
        )}

        {tickets.data && orders.length === 0 && (
          <div className="rounded-2xl bg-surface p-10 text-center">
            <p className="font-semibold">
              {tab === 'upcoming' ? 'No upcoming tickets' : 'No past tickets'}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {tab === 'upcoming'
                ? 'Book a session and it will appear here.'
                : 'Films you have already seen will be listed here.'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-bold">{order.session.movie.title}</h3>
                    {order.status === 'refunded' && (
                      <span className="rounded bg-surface-raised px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                        Refunded
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {order.session.venue.name} · Hall {order.session.hall.name} ·{' '}
                    {order.session.date} · {order.session.time}
                  </p>
                  <p className="mt-1 text-xs text-ink-dim">Reference {order.reference}</p>
                </div>
                <span className="shrink-0 text-lg font-extrabold">₾{order.totalPrice}</span>
              </div>

              <ul className="mt-4 flex flex-wrap gap-2 border-t border-line/60 pt-4">
                {order.tickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="rounded-lg bg-surface-raised px-2.5 py-1 text-[11px] font-semibold"
                  >
                    {ticket.seatCode}
                    <span className="ml-1.5 font-normal text-ink-muted">
                      {ticket.ticketType?.name}
                    </span>
                  </li>
                ))}
              </ul>

              {order.isRefundable && (
                <button
                  type="button"
                  onClick={() => onRefund(order)}
                  disabled={refund.isPending}
                  className="mt-4 h-10 rounded-full border border-line px-5 text-xs font-semibold transition-colors hover:bg-surface-raised disabled:opacity-50"
                >
                  {refund.isPending ? 'Refunding…' : 'Refund this order'}
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
