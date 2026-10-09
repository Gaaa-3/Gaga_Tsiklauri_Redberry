/** My Tickets and refunds. */
import { requestData } from '../lib/http'

export function getTickets(filter) {
  return requestData('/tickets', { query: { filter } })
}

/** Allowed up to 2 hours before the session. Drive the button off the order's
 *  `isRefundable` rather than computing the cutoff here — a wrong clock would
 *  otherwise offer a button that fails. A 422 means refused, and the message
 *  says why. Re-render the card from the returned order. */

export function refundOrder(orderId) {
  return requestData(`/orders/${orderId}/refund`, { method: 'POST' })
}
