# Kino XII API — Reference

Base URL: `https://api.kinoxii.redberryinternship.ge/api`
Interactive docs: `https://api.kinoxii.redberryinternship.ge/docs`
Full machine-readable spec: [`openapi.json`](./openapi.json) (OpenAPI 3.0.3, 21 endpoints, 16 schemas)
Real sample payloads: [`sample-filter-options.json`](./sample-filter-options.json), [`sample-responses.json`](./sample-responses.json)

> The API docs say: **"This page is the contract: if the frontend and this disagree, this is right."**

## Conventions

- Money is **Georgian lari as a plain number** — `24`, `14.5`. Not strings, not minor units.
- Field names are **camelCase**, with one exception: `password_confirmation` on `/register`.
- Auth: `Authorization: Bearer <token>` on every protected request.
- Array query filters take **slugs, not ids**, and use `name[]=` syntax.

## Boot sequence

1. `GET /filter-options` once at boot, then cache it. Venues, formats, languages, time bands, sorts,
   ticket types, age ratings, the 3-seat cap and the 8-minute hold **all come from here**. Hardcode none of it.
2. `GET /movies/now-playing`, `/movies/coming-soon`, `/movies/featured` for the home page.
3. `GET /sessions` for the sessions page; mirror every filter into the URL.
4. Booking is three calls: `GET /sessions/{id}/seats` → `POST /sessions/{id}/holds` → `POST /orders`.

---

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | – | Create account, returns a token (no separate login) |
| POST | `/login` | – | Returns a token |
| POST | `/logout` | Bearer | Revoke the token |
| GET | `/me` | Bearer | Current user; call on boot when a token is stored |
| PUT | `/profile` | Bearer | Update profile (`multipart/form-data`) |
| GET | `/filter-options` | – | **All** reference data + `maxSeatsPerOrder`, `holdMinutes` |
| GET | `/search?q=` | – | Header typeahead, max 6 results, blank `q` → `[]` |
| GET | `/movies/now-playing` | – | Now Playing list (carries `synopsis`) |
| GET | `/movies/coming-soon` | – | Coming Soon list |
| GET | `/movies/featured` | – | Hero carousel titles (subset of Now Playing, bookable) |
| GET | `/movies/{movie}` | – | Movie detail — **takes the slug**, numeric id 404s |
| GET | `/movies/{movie}/sessions` | – | That film's sessions |
| POST | `/movies/{movie}/notify` | Bearer | "Notify Me" for a Coming Soon title; idempotent, always 201 |
| GET | `/sessions` | – | Grouped sessions list (the sessions page) |
| GET | `/sessions/{session}` | – | One session |
| GET | `/sessions/{session}/seats` | – | **The hall map.** Public; a token also sets `isMine` |
| POST | `/sessions/{session}/holds` | Bearer | Hold seats for 8 minutes (step 1 → step 2) |
| GET | `/holds/{hold}` | Bearer | Read a hold back (resume countdown after reload) |
| DELETE | `/holds/{hold}` | Bearer | Release a hold |
| POST | `/orders` | Bearer | Pay and complete; the only call that sells seats |
| POST | `/orders/{order}/refund` | Bearer | Refund; allowed up to 2h before the session |
| GET | `/tickets?filter=upcoming\|past` | Bearer | My Tickets, newest session first |

> **There are no foyer / concessions / menu endpoints.** See `AI_CONTEXT.md` §3.

---

## Error handling

| Code | What happened | What to do |
|---|---|---|
| `401` | Token missing, expired or revoked | Open the login modal, then **replay the action** so the user doesn't click twice |
| `403` | The record belongs to another account | Nothing the user can fix; usually a bug |
| `409` | Someone took the seats first | Read `contested`, mark those sold, keep the rest of the selection, refetch the map |
| `422` + `errors` | Field validation | Map each key in `errors` onto its input |
| `422`, `message` only | A **booking rule** blocked it | Show `message` as it comes: incomplete profile, age gate, or expired hold |
| `404` | No such record | — |
| `500` | Server fault | Show a retry |

> **The two shapes of `422` are the one thing worth getting right early.** `errors` present means a
> form problem. `errors` absent means a rule problem, and the message is already written for the user.

### Rules the API enforces server-side

Mirror them in the UI anyway, so the user is never offered something that will fail:

- at most **3 seats** per order;
- **child tickets** refused on 16+ and 18+ titles;
- an **age gate** against the profile date of birth;
- **holds last 8 minutes**, then the seats free themselves;
- **refunds** close **2 hours** before the session starts;
- **booking needs a complete profile**: `fullName`, `mobileNumber`, `dateOfBirth`.

---

## Schemas

### `User`
```ts
{ id: number; username: string; email: string; avatar: string | null;
  fullName: string | null; mobileNumber: string | null;   // "599123456"
  dateOfBirth: string | null;                             // "1999-04-02"
  age: number | null;                                     // derived server-side — use this
  preferredVenue: Venue | null; profileComplete: boolean }
```

### `Movie`
```ts
{ id: number; slug: string; title: string; kind: "film" | ...;
  runtimeMinutes: number; posterUrl: string; backdropUrl: string;
  releaseDate: string; isComingSoon: boolean; isNotified: boolean; isFeatured: boolean;
  fromPrice: number; ageRating: AgeRating; genres: Genre[]; formats: Format[] }
```
`MovieDetail` = `Movie` + `{ synopsis, director, cast, availableDates: string[] }`
(`availableDates` = days with at least one upcoming session, for the day picker.)
`now-playing` and `featured` also carry `synopsis`.

### `Session`
```ts
{ id: number; startsAt: string;       // "2026-10-07T10:00:00+00:00"
  date: string; time: string;          // "2026-10-07", "10:00"
  timeBand: "morning" | "afternoon" | "evening";
  price: number; seatsLeft: number; isSoldOut: boolean;
  hall: { id, name, venue: Venue }; venue: Venue;
  format: Format; language: Language; movie: Movie }
```
`seatsLeft` is live and counts both sold seats and seats under someone else's hold.

### `Seat`
```ts
{ id: number;          // send THIS as seatId when holding — never `code`
  code: string;        // "E7" — show in the summary, order and ticket
  label: string;       // "7"  — put this inside the seat button
  state: "available" | "sold" | "held" | "unavailable";
  aisleAfter: boolean; // true = gangway to the right of this seat
  isMine: boolean }    // part of YOUR live hold
```

### `SeatMap` — `GET /sessions/{id}/seats`
```ts
{ data: { sessionId: number; hall: { id, name, venue: Venue };
          sections: { name: string; rows: { label: string; seats: Seat[] }[] }[] } }
```
Section names seen: `Front stalls`, `Rear stalls`, `Stalls`, `Balcony`, `Circle`, `Boxes`.
**Draw the map from this response.** The four halls are shaped differently — a hardcoded grid will be
wrong for three of them. Rows within one section share a width; rows in different sections usually do
not (hall B: 10-wide front, 14-wide rear). Never flatten the nesting. Row labels come from the data
(hall D goes `G` then `J`, skipping `I`) — never derive a label from an array index.

### `SeatHold` — `POST /sessions/{id}/holds` (201)
```ts
{ data: { holdId: string;        // uuid
          sessionId: number;
          expiresAt: string;     // drive the countdown from THIS, not secondsRemaining
          secondsRemaining: number; isLive: boolean; subtotal: number;
          seats: { seatId: number; code: string; ticketType: string; price: number }[] } }
```
Request body:
```json
{ "seats": [ { "seatId": 93, "ticketType": "adult" } ] }
```
1–3 items. `GET /holds/{id}` on an **expired** hold still returns `200` with `isLive: false` and
`secondsRemaining: 0` — that is how you tell "your hold ran out" apart from `404` "never existed".

### `Order` — `POST /orders` (201), `/orders/{id}/refund`, `/tickets`
```ts
{ data: { id: number; reference: string;            // "KX-7QF2LD"
          status: "paid" | "refunded"; totalPrice: number;
          paidAt: string; refundedAt: string | null;
          isUpcoming: boolean; isRefundable: boolean;  // drive the Refund button off this
          cardLastFour: string;
          contact: { fullName, email, mobileNumber };
          session: Session;
          tickets: { id, seatCode, ticketType, price }[] } }
```

### `TicketType` (from `/filter-options`)
```ts
{ id: number; slug: "adult" | "child" | "student"; name: string;
  priceRatio: number;              // 1 | 0.6 | 0.75
  note: string | null; blockedFromRatingAge: number | null }   // child → 16
```

### `ValidationError` (422)
```ts
{ message: string; errors?: Record<string, string[]> }
```

---

## Request bodies

### `POST /register` — `multipart/form-data`
`username` (min 3, unique) · `email` (unique) · `password` (min 3) ·
`password_confirmation` **(snake_case)** · `avatar` (file, optional)
→ `201` with a token. The new account has `profileComplete: false`.

### `POST /login` — `application/json`
`{ "email": "...", "password": "..." }` → `200` with a token. `401` = wrong credentials: keep the modal
open, keep the email, show `message` inside it.

### `PUT /profile` — `multipart/form-data`
`fullName` (min 3) · `mobileNumber` (`^5\d{8}$`, spaces stripped) · `dateOfBirth` (date) ·
`preferredVenueId` (optional) · `avatar` (file, optional).
`email` is set at registration and **cannot be changed** — sending it is ignored, not rejected.
The `errors` messages are the exact strings the brief specifies — **show them as returned**.

### `POST /orders` — `application/json`
`holdId` · `fullName` · `email` · `mobileNumber` · `cardNumber` (16 digits) ·
`expiry` (`^(0[1-9]|1[0-2])/\d{2}$`, future) · `cvv` (3 digits).
Spaces in the card and mobile numbers are stripped for you. Payment is simulated; only the last four
digits are kept. `4242 4242 4242 4242` is the conventional test card.

---

## `GET /sessions` — the sessions list

Query parameters:

| Param | Type | Notes |
|---|---|---|
| `date` | `date` | single value; defaults to today |
| `venues[]` | `string[]` | slugs |
| `formats[]` | `string[]` | slugs |
| `languages[]` | `string[]` | slugs |
| `bands[]` | `string[]` | `morning` \| `afternoon` \| `evening` |
| `search` | `string` | max 100 chars |
| `sort` | `string` | `time_asc` \| `time_desc` \| `price_asc` \| `price_desc` \| `title_asc` |
| `page` | `int ≥ 1` | |

Every filter is an **AND** against the others and an **OR** within itself:
`venues[]=galleria&venues[]=vake&formats[]=max` means *(Galleria or Vake) and MAX*.

Response:
```ts
{ data: { movie: Movie; sessions: Session[] }[],   // one group per film, showtimes pre-sorted
  meta: { currentPage, lastPage, perPage, totalSessions, totalMovies, date } }
```

**Pagination counts films, not sessions** — 10 films per page, which is what `meta.lastPage` is over.
A page can therefore hold far more than 10 sessions. `meta.totalSessions` is the number for the
"Showing X sessions" counter.

Two things to get right:
1. changing any filter or the sort must reset `page` to 1;
2. selecting venues should narrow the format list to the formats those venues actually have
   (`venue.formats`), dropping any selected format they do not.

Deep-link form:
```
/sessions?venues[]=galleria&venues[]=vake&date=2026-11-14&formats[]=max&sort=price_asc&page=2
```

---

## `GET /filter-options` — the reference payload

Full live copy in [`sample-filter-options.json`](./sample-filter-options.json). Shape:

```ts
{ data: {
    venues:  { id, slug, name, city, formats: Format[] }[],   // 4 venues
    formats: { id, slug, name, priceUplift }[],                // 5
    languages: { id, slug, name, code }[],                     // 4
    timeBands: { id: "morning"|"afternoon"|"evening", label }[],
    sorts: { id, label }[],                                    // 5
    ticketTypes: TicketType[],                                 // 3
    ageRatings: { code, minAge, description }[],                // G, PG, 12+, 16+, 18+
    maxSeatsPerOrder: 3,
    holdMinutes: 8 } }
```

Live values as of 2026-10-08:

- **Venues:** Galleria Tbilisi (Tbilisi), Batumi Boulevard (Batumi), Rustaveli Palace (Tbilisi), Vake Park (Tbilisi)
- **Formats + uplift:** Standard +0, ATMOS +4, PANORAMA +5, MAX +6, MOTION +8
  - Galleria has all 5; Batumi has Standard/MAX/ATMOS; Rustaveli has Standard/ATMOS/PANORAMA;
    Vake has Standard/MAX/MOTION. **This is why the format filter must narrow by venue.**
- **Languages:** Georgian Dub (GEO), Georgian Subtitles (ENG), Original with Subtitles (ENG), Russian Dub (RUS)
- **Age ratings:** G/0, PG/0, 12+/12, 16+/16, 18+/18 — each with a `description` string the movie
  detail page must display
