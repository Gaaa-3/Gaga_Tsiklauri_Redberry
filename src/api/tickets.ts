/** My Tickets and refunds. */

import { requestData } from '../lib/http'
import type { Order } from '../types/api'

/** `upcoming` = paid orders whose session has not started.
 *  `past` = sessions that have already run AND every refunded order, whatever
 *  its date. Newest session first. Each order carries its full session and
 *  tickets, so a card renders without a second request. */
export type TicketFilter = 'upcoming' | 'past'

export function getTickets(filter: TicketFilter) {
  return requestData<Order[]>('/tickets', { query: { filter } })
}

/** Allowed up to 2 hours before the session. Drive the button off the order's
 *  `isRefundable` rather than computing the cutoff here — a wrong clock would
 *  otherwise offer a button that fails. A 422 means refused, and the message
 *  says why. Re-render the card from the returned order. */
export function refundOrder(orderId: number) {
  return requestData<Order>(`/orders/${orderId}/refund`, { method: 'POST' })
}
