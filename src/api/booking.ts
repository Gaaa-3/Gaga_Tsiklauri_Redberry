/** The three calls that sell a ticket: hold the seats, then pay.
 *  A user has at most one hold per session — calling holds again replaces the
 *  previous one, so the old one never needs releasing first. */

import { request, requestData } from '../lib/http'
import type { Order, SeatHold, TicketType } from '../types/api'

export interface HoldSeatInput {
  /** `id` from the seat map. Never the `code`. */
  seatId: number
  ticketType: TicketType['slug']
}

/** 1-3 seats. The response carries `expiresAt` — drive the countdown from that,
 *  not from `secondsRemaining`, or a backgrounded tab makes the timer drift.
 *  409 means nothing was held and `contested` names the seat codes that went. */
export function holdSeats(sessionId: number, seats: HoldSeatInput[]) {
  return requestData<SeatHold>(`/sessions/${sessionId}/holds`, {
    method: 'POST',
    json: { seats },
  })
}

/** Reads a hold back after a page reload. An expired hold still returns 200,
 *  with `isLive: false` and `secondsRemaining: 0` — that is how "your hold ran
 *  out" is told apart from a 404 "never existed". */
export function getHold(holdId: string) {
  return requestData<SeatHold>(`/holds/${holdId}`)
}

/** Called when the modal closes without paying. 204, no body. Not called when
 *  stepping from checkout back to seat selection. */
export function releaseHold(holdId: string) {
  return request<void>(`/holds/${holdId}`, { method: 'DELETE' })
}

export interface OrderInput {
  holdId: string
  fullName: string
  email: string
  /** Georgian, 9 digits starting with 5. Spaces are stripped server-side. */
  mobileNumber: string
  /** 16 digits. Spaces are stripped server-side. */
  cardNumber: string
  /** MM/YY, and must be in the future. */
  expiry: string
  cvv: string
}

/** The only call that actually sells seats. Payment is simulated: only the last
 *  four digits are kept. Render the confirmation from this response body rather
 *  than from local state. */
export function createOrder(input: OrderInput) {
  return requestData<Order>('/orders', { method: 'POST', json: input })
}
