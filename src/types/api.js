/** Shapes of the Kino XII API, written as JSDoc typedefs. Source of truth:
 *  docs/openapi.json. Money is lari as a plain number (24, 14.5) — not strings,
 *  not minor units.
 *
 *  Nothing here runs: it is documentation that editors read, so hovering a
 *  `session` or a `seat` anywhere in the app still shows every field and the
 *  notes about it. Import a shape with:
 *    \@param {import('../types/api').Session} session
 */

/**
 * @typedef {object} Venue
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {string} city
 * @property {Format[]} [formats] Only on /filter-options venues — drives the
 *   dynamic format filter.
 */

/**
 * @typedef {object} Format
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {number} priceUplift
 */

/**
 * @typedef {object} Language
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {string} code
 */

/**
 * @typedef {object} Genre
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 */

/**
 * @typedef {object} AgeRating
 * @property {'G'|'PG'|'12+'|'16+'|'18+'} code
 * @property {number} minAge
 * @property {string} description
 */

/**
 * @typedef {object} TicketType
 * @property {number} id
 * @property {'adult'|'child'|'student'} slug
 * @property {string} name
 * @property {number} priceRatio adult 1, student 0.75, child 0.6 — read from
 *   the API, never hardcoded.
 * @property {string|null} note
 * @property {number|null} blockedFromRatingAge Child is 16, meaning it is
 *   refused on 16+ and 18+ titles.
 */

/** @typedef {'morning'|'afternoon'|'evening'} TimeBand */

/**
 * @typedef {object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {string|null} avatar
 * @property {string|null} fullName
 * @property {string|null} mobileNumber
 * @property {string|null} dateOfBirth
 * @property {number|null} age Derived server-side. Use this rather than doing
 *   date maths on the client.
 * @property {Venue|null} preferredVenue
 * @property {boolean} profileComplete False until fullName, mobileNumber and
 *   dateOfBirth are all set. Booking is blocked while it is false.
 */

/**
 * @typedef {object} Movie
 * @property {number} id
 * @property {string} slug
 * @property {string} title
 * @property {string} kind
 * @property {number} runtimeMinutes
 * @property {string} posterUrl
 * @property {string} backdropUrl
 * @property {string} releaseDate
 * @property {boolean} isComingSoon
 * @property {boolean} isNotified
 * @property {boolean} isFeatured
 * @property {number} fromPrice
 * @property {AgeRating} ageRating
 * @property {Genre[]} genres
 * @property {Format[]} formats
 * @property {string} [synopsis] Present on now-playing, featured and detail.
 */

/**
 * @typedef {Movie & {
 *   synopsis: string,
 *   director: string|null,
 *   cast: string|null,
 *   availableDates: string[]
 * }} MovieDetail
 * availableDates holds the days with at least one upcoming session, for the
 * day picker.
 */

/**
 * @typedef {object} Hall
 * @property {number} id
 * @property {string} name
 * @property {Venue} venue
 */

/**
 * @typedef {object} Session
 * @property {number} id
 * @property {string} startsAt ISO with offset, "2026-10-07T10:00:00+00:00".
 * @property {string} date
 * @property {string} time
 * @property {TimeBand} timeBand
 * @property {number} price
 * @property {number} seatsLeft Live: counts sold seats and seats under someone
 *   else's hold.
 * @property {boolean} isSoldOut
 * @property {Hall} hall
 * @property {Venue} venue
 * @property {Format} format
 * @property {Language} language
 * @property {Movie} movie
 */

/** @typedef {'available'|'sold'|'held'|'unavailable'} SeatState */

/**
 * @typedef {object} Seat
 * @property {number} id Send this as seatId when holding seats. Never send code.
 * @property {string} code Human label, "E7". Shown in the summary and ticket.
 * @property {string} label Just the number within the row, "7". Goes inside
 *   the seat button.
 * @property {SeatState} state
 * @property {boolean} aisleAfter True means a gangway runs to the right.
 * @property {boolean} isMine This seat is part of the current user's live hold.
 */

/**
 * @typedef {object} SeatRow
 * @property {string} label Comes from the data — hall D goes G then J, skipping
 *   I. Never derive it from an array index.
 * @property {Seat[]} seats
 */

/**
 * @typedef {object} SeatSection
 * @property {string} name
 * @property {SeatRow[]} rows Rows in one section share a width; rows in
 *   different sections usually do not. Never flatten the nesting into one grid.
 */

/**
 * @typedef {object} SeatMap
 * @property {number} sessionId
 * @property {Hall} hall
 * @property {SeatSection[]} sections
 */

/**
 * @typedef {object} HeldSeat
 * @property {number} seatId
 * @property {string} code
 * @property {'adult'|'child'|'student'} ticketType
 * @property {number} price
 */

/**
 * @typedef {object} SeatHold
 * @property {string} holdId
 * @property {number} sessionId
 * @property {string} expiresAt Drive the countdown from this, not from
 *   secondsRemaining, so a slow render or a backgrounded tab does not drift.
 * @property {number} secondsRemaining
 * @property {boolean} isLive
 * @property {number} subtotal
 * @property {HeldSeat[]} seats
 */

/**
 * @typedef {object} Ticket
 * @property {number} id
 * @property {string} seatCode
 * @property {'adult'|'child'|'student'} ticketType
 * @property {number} price
 */

/**
 * @typedef {object} OrderContact
 * @property {string} fullName
 * @property {string} email
 * @property {string} mobileNumber
 */

/**
 * @typedef {object} Order
 * @property {number} id
 * @property {string} reference e.g. "KX-7QF2LD".
 * @property {'paid'|'refunded'} status
 * @property {number} totalPrice
 * @property {string} paidAt
 * @property {string|null} refundedAt
 * @property {boolean} isUpcoming
 * @property {boolean} isRefundable Already false inside the 2 hour cutoff and
 *   once refunded. Drive the Refund button off this rather than computing the
 *   cutoff client-side.
 * @property {string} cardLastFour
 * @property {OrderContact} contact
 * @property {Session} session
 * @property {Ticket[]} tickets
 */

/**
 * @typedef {object} SortOption
 * @property {'time_asc'|'time_desc'|'price_asc'|'price_desc'|'title_asc'} id
 * @property {string} label
 */

/**
 * @typedef {object} TimeBandOption
 * @property {TimeBand} id
 * @property {string} label
 */

/**
 * @typedef {object} FilterOptions
 * @property {Venue[]} venues
 * @property {Format[]} formats
 * @property {Language[]} languages
 * @property {TimeBandOption[]} timeBands
 * @property {SortOption[]} sorts
 * @property {TicketType[]} ticketTypes
 * @property {AgeRating[]} ageRatings
 * @property {number} maxSeatsPerOrder
 * @property {number} holdMinutes
 */

/**
 * One film with its showtimes for the selected date, already sorted by start time.
 * @typedef {object} SessionGroup
 * @property {Movie} movie
 * @property {Session[]} sessions
 */

/**
 * One venue with that film's showtimes — the shape of GET /movies/{slug}/sessions.
 * @typedef {object} VenueSessionGroup
 * @property {Venue} venue
 * @property {Session[]} sessions
 */

/**
 * @typedef {object} SessionsMeta
 * @property {number} currentPage
 * @property {number} lastPage Counts FILMS, not sessions — 10 films per page.
 * @property {number} perPage
 * @property {number} totalSessions The number for the "Showing X sessions" counter.
 * @property {number} totalMovies
 * @property {string} date
 */

/**
 * @typedef {object} SessionsResponse
 * @property {SessionGroup[]} data
 * @property {SessionsMeta} meta
 */

/**
 * @typedef {object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

// This file only declares types, so it exports nothing at runtime.

export {}
