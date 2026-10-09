/** The sessions list and the hall map. */
import { request, requestData } from '../lib/http'

/** Returns `{ data, meta }`, so this one keeps the whole body: `meta` carries
 *  the page count and the "Showing X sessions" number. */

export function getSessions(query = {}) {
  return request('/sessions', { query: { ...query } })
}

export function getSession(sessionId) {
  return requestData(`/sessions/${sessionId}`)
}

/** Public, but sending a token also fills in `isMine`, which is how a selection
 *  is restored after a reload. Draw the map strictly from this response. */

export function getSeatMap(sessionId) {
  return requestData(`/sessions/${sessionId}/seats`)
}
