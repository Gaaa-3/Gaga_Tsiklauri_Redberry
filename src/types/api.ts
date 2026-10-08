/** Types mirroring the Kino XII API. Source of truth: docs/openapi.json.
 *  Money is lari as a plain number (24, 14.5) — not strings, not minor units. */

export interface Venue {
  id: number
  slug: string
  name: string
  city: string
  /** Only present on /filter-options venues — drives the dynamic format filter. */
  formats?: Format[]
}

export interface Format {
  id: number
  slug: string
  name: string
  priceUplift: number
}

export interface Language {
  id: number
  slug: string
  name: string
  code: string
}

export interface Genre {
  id: number
  slug: string
  name: string
}

export interface AgeRating {
  code: 'G' | 'PG' | '12+' | '16+' | '18+'
  minAge: number
  description: string
}

export interface TicketType {
  id: number
  slug: 'adult' | 'child' | 'student'
  name: string
  /** adult 1, student 0.75, child 0.6 — read from the API, never hardcoded. */
  priceRatio: number
  note: string | null
  /** Child is 16, meaning it is refused on 16+ and 18+ titles. */
  blockedFromRatingAge: number | null
}

export type TimeBand = 'morning' | 'afternoon' | 'evening'

export interface User {
  id: number
  username: string
  email: string
  avatar: string | null
  fullName: string | null
  mobileNumber: string | null
  dateOfBirth: string | null
  /** Derived server-side. Use this rather than doing date maths on the client. */
  age: number | null
  preferredVenue: Venue | null
  /** False until fullName, mobileNumber and dateOfBirth are all set. Booking is
   *  blocked while it is false. */
  profileComplete: boolean
}

export interface Movie {
  id: number
  slug: string
  title: string
  kind: string
  runtimeMinutes: number
  posterUrl: string
  backdropUrl: string
  releaseDate: string
  isComingSoon: boolean
  isNotified: boolean
  isFeatured: boolean
  fromPrice: number
  ageRating: AgeRating
  genres: Genre[]
  formats: Format[]
  /** Present on now-playing, featured and movie detail. */
  synopsis?: string
}

export interface MovieDetail extends Movie {
  synopsis: string
  director: string | null
  cast: string | null
  /** Days with at least one upcoming session, for the day picker. */
  availableDates: string[]
}

export interface Hall {
  id: number
  name: string
  venue: Venue
}

export interface Session {
  id: number
  /** ISO with offset, e.g. "2026-10-07T10:00:00+00:00". */
  startsAt: string
  date: string
  time: string
  timeBand: TimeBand
  price: number
  /** Live: counts sold seats and seats under someone else's hold. */
  seatsLeft: number
  isSoldOut: boolean
  hall: Hall
  venue: Venue
  format: Format
  language: Language
  movie: Movie
}

export type SeatState = 'available' | 'sold' | 'held' | 'unavailable'

export interface Seat {
  /** Send this as seatId when holding seats. Never send `code`. */
  id: number
  /** Human label, "E7". Shown in the summary, order and ticket. */
  code: string
  /** Just the number within the row, "7". Goes inside the seat button. */
  label: string
  state: SeatState
  /** True means a gangway runs to the right of this seat. */
  aisleAfter: boolean
  /** This seat is part of the current user's live hold. */
  isMine: boolean
}

export interface SeatRow {
  /** Comes from the data — hall D goes G then J, skipping I. Never derive it
   *  from an array index. */
  label: string
  seats: Seat[]
}

export interface SeatSection {
  name: string
  /** Rows in one section share a width; rows in different sections usually do
   *  not. Never flatten the nesting into a single grid. */
  rows: SeatRow[]
}

export interface SeatMap {
  sessionId: number
  hall: Hall
  sections: SeatSection[]
}

export interface HeldSeat {
  seatId: number
  code: string
  ticketType: TicketType['slug']
  price: number
}

export interface SeatHold {
  holdId: string
  sessionId: number
  /** Drive the countdown from this, not from secondsRemaining, so a slow render
   *  or a backgrounded tab does not drift. */
  expiresAt: string
  secondsRemaining: number
  isLive: boolean
  subtotal: number
  seats: HeldSeat[]
}

export interface Ticket {
  id: number
  seatCode: string
  ticketType: TicketType['slug']
  price: number
}

export interface Order {
  id: number
  /** e.g. "KX-7QF2LD". */
  reference: string
  status: 'paid' | 'refunded'
  totalPrice: number
  paidAt: string
  refundedAt: string | null
  isUpcoming: boolean
  /** Already false inside the 2 hour cutoff and once refunded. Drive the Refund
   *  button off this rather than computing the cutoff client-side. */
  isRefundable: boolean
  cardLastFour: string
  contact: {
    fullName: string
    email: string
    mobileNumber: string
  }
  session: Session
  tickets: Ticket[]
}

export interface SortOption {
  id: 'time_asc' | 'time_desc' | 'price_asc' | 'price_desc' | 'title_asc'
  label: string
}

export interface FilterOptions {
  venues: Venue[]
  formats: Format[]
  languages: Language[]
  timeBands: { id: TimeBand; label: string }[]
  sorts: SortOption[]
  ticketTypes: TicketType[]
  ageRatings: AgeRating[]
  maxSeatsPerOrder: number
  holdMinutes: number
}

/** One film with its showtimes for the selected date, already sorted by start time. */
export interface SessionGroup {
  movie: Movie
  sessions: Session[]
}

/** One venue with that film's showtimes — the shape of GET /movies/{slug}/sessions. */
export interface VenueSessionGroup {
  venue: Venue
  sessions: Session[]
}

export interface SessionsMeta {
  currentPage: number
  /** Counts FILMS, not sessions — 10 films per page. */
  lastPage: number
  perPage: number
  /** The number for the "Showing X sessions" counter. */
  totalSessions: number
  totalMovies: number
  date: string
}

export interface SessionsResponse {
  data: SessionGroup[]
  meta: SessionsMeta
}

export interface AuthResponse {
  token: string
  user: User
}

/** Envelope used by most endpoints. */
export interface Envelope<T> {
  data: T
}
