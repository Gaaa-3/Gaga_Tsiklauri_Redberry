/** The single place every network call goes through. It adds the base URL, the
 *  bearer token and the JSON headers, and turns every failure into one ApiError
 *  the UI can branch on by status.
 *  Error contract: docs/API_REFERENCE.md, "Error handling". */
import { clearToken, readToken } from './token'

/** Set by the auth provider. http.js cannot reach React state, so a token that
 *  the server has rejected is reported through here: the provider drops the
 *  user and opens the login modal, and whatever was interrupted is replayed
 *  once the user is back in. */
let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.kinoxii.redberryinternship.ge/api'
).replace(/\/+$/, '')

/** Shown when the API sends no message of its own (an HTML 500 page, say). */

const FALLBACK_MESSAGES = {
  0: 'Could not reach the server. Check your connection and try again.',
  401: 'Please log in to continue.',
  403: 'This record belongs to another account.',
  404: 'We could not find that.',
  409: 'Someone took those seats first.',
  500: 'Something went wrong on our side. Please try again.',
}

/** Every failed request throws this, so a component only ever checks `status`. */

export class ApiError extends Error {
  status
  /** 422 only, and only when the API sent `errors` — a form problem. */
  errors
  /** 409 only: the seat codes someone else got first, e.g. ["E7", "E8"]. */
  contested
  constructor(status, message, errors = null, contested = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.contested = contested
  }
  /** 422 carrying `errors`: put each message under its own input. */
  get isFieldError() {
    return this.status === 422 && this.errors !== null
  }
  /** 422 carrying only `message`: a booking rule blocked it (incomplete profile,
   *  age gate, expired hold). The text is already written for the user, so show
   *  it word for word. */
  get isRuleError() {
    return this.status === 422 && this.errors === null
  }
  /** The first message for one field, or null if that field is fine. */
  fieldError(field) {
    return this.errors?.[field]?.[0] ?? null
  }
}

/** Arrays go out as `venues[]=galleria&venues[]=vake`, which is what the API
 *  expects. Empty, null and undefined values are dropped rather than sent blank. */

function buildQuery(query) {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(`${key}[]`, item)
    } else {
      params.append(key, String(value))
    }
  }
  const search = params.toString()
  return search ? `?${search}` : ''
}

async function toApiError(response) {
  let payload = {}
  try {
    payload = await response.json()
  } catch {
    // Not JSON — a server fault can arrive as an HTML page.
  }
  const message =
    payload.message ?? FALLBACK_MESSAGES[response.status] ?? 'The request failed. Please try again.'
  return new ApiError(response.status, message, payload.errors ?? null, payload.contested ?? null)
}

/** Returns the whole parsed body. Use it when the body is not a plain
 *  `{ data }` envelope — GET /sessions also carries `meta`. */

export async function request(path, options = {}) {
  const token = readToken()
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  // FormData sets its own Content-Type with the multipart boundary, so it must
  // not be set by hand here.
  if (options.json !== undefined) headers['Content-Type'] = 'application/json'
  let response
  try {
    response = await fetch(BASE_URL + path + buildQuery(options.query), {
      method: options.method ?? 'GET',
      headers,
      body: options.form ?? (options.json === undefined ? undefined : JSON.stringify(options.json)),
    })
  } catch {
    // The request never left: offline, DNS, CORS. Status 0 means "no reply".
    throw new ApiError(0, FALLBACK_MESSAGES[0])
  }
  if (!response.ok) {
    // A rejected token is dead for good, so drop it and let the next call go
    // out as a guest, then tell the app so the login modal can open.
    if (response.status === 401 && token) {
      clearToken()
      onUnauthorized?.()
    }
    throw await toApiError(response)
  }
  // 204 from /logout and DELETE /holds/{id} has no body to parse.
  if (response.status === 204) return undefined
  return await response.json()
}

/** Returns `body.data`, which is the shape of almost every endpoint. */

export async function requestData(path, options = {}) {
  const body = await request(path, options)
  return body.data
}
