/** The sessions list and the hall map. */

import { request, requestData } from '../lib/http'
import type { SeatMap, Session, SessionsResponse, SortOption, TimeBand } from '../types/api'

/** Mirrors the query string on /sessions. Array filters take SLUGS, not ids.
 *  Each filter is an AND against the others and an OR within itself:
 *  venues=[galleria, vake] + formats=[max] means (Galleria OR Vake) AND MAX. */
export interface SessionsQuery {
  /** Single day, defaults to today server-side. */
  date?: string
  venues?: string[]
  formats?: string[]
  languages?: string[]
  bands?: TimeBand[]
  /** Max 100 characters. */
  search?: string
  sort?: SortOption['id']
  /** Pages over FILMS, 10 per page — not over sessions. */
  page?: number
}

/** Returns `{ data, meta }`, so this one keeps the whole body: `meta` carries
 *  the page count and the "Showing X sessions" number. */
export function getSessions(query: SessionsQuery = {}) {
  return request<SessionsResponse>('/sessions', { query: { ...query } })
}

export function getSession(sessionId: number) {
  return requestData<Session>(`/sessions/${sessionId}`)
}

/** Public, but sending a token also fills in `isMine`, which is how a selection
 *  is restored after a reload. Draw the map strictly from this response. */
export function getSeatMap(sessionId: number) {
  return requestData<SeatMap>(`/sessions/${sessionId}/seats`)
}
