/** The single place every network call goes through. It adds the base URL, the
 *  bearer token and the JSON headers, and turns every failure into one ApiError
 *  the UI can branch on by status.
 *  Error contract: docs/API_REFERENCE.md, "Error handling". */

import type { Envelope } from '../types/api'
import { clearToken, readToken } from './token'

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.kinoxii.redberryinternship.ge/api'
).replace(/\/+$/, '')

/** Validation messages keyed by input name: { mobileNumber: ["Mobile number is required"] }. */
export type FieldErrors = Record<string, string[]>

/** Shown when the API sends no message of its own (an HTML 500 page, say). */
const FALLBACK_MESSAGES: Record<number, string> = {
  0: 'Could not reach the server. Check your connection and try again.',
  401: 'Please log in to continue.',
  403: 'This record belongs to another account.',
  404: 'We could not find that.',
  409: 'Someone took those seats first.',
  500: 'Something went wrong on our side. Please try again.',
}

/** Every failed request throws this, so a component only ever checks `status`. */
export class ApiError extends Error {
  readonly status: number
  /** 422 only, and only when the API sent `errors` — a form problem. */
  readonly errors: FieldErrors | null
  /** 409 only: the seat codes someone else got first, e.g. ["E7", "E8"]. */
  readonly contested: string[] | null

  constructor(
    status: number,
    message: string,
    errors: FieldErrors | null = null,
    contested: string[] | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.contested = contested
  }

  /** 422 carrying `errors`: put each message under its own input. */
  get isFieldError(): boolean {
    return this.status === 422 && this.errors !== null
  }

  /** 422 carrying only `message`: a booking rule blocked it (incomplete profile,
   *  age gate, expired hold). The text is already written for the user, so show
   *  it word for word. */
  get isRuleError(): boolean {
    return this.status === 422 && this.errors === null
  }

  /** The first message for one field, or null if that field is fine. */
  fieldError(field: string): string | null {
    return this.errors?.[field]?.[0] ?? null
  }
}

export type QueryValue = string | number | boolean | string[] | undefined | null
export type QueryParams = Record<string, QueryValue>

/** Arrays go out as `venues[]=galleria&venues[]=vake`, which is what the API
 *  expects. Empty, null and undefined values are dropped rather than sent blank. */
function buildQuery(query: QueryParams | undefined): string {
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

async function toApiError(response: Response): Promise<ApiError> {
  let payload: { message?: string; errors?: FieldErrors; contested?: string[] } = {}
  try {
    payload = await response.json()
  } catch {
    // Not JSON — a server fault can arrive as an HTML page.
  }

  const message =
    payload.message ?? FALLBACK_MESSAGES[response.status] ?? 'The request failed. Please try again.'
  return new ApiError(response.status, message, payload.errors ?? null, payload.contested ?? null)
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: QueryParams
  /** Sent as application/json. */
  json?: unknown
  /** Sent as multipart/form-data — /register and /profile need this. */
  form?: FormData
}

/** Returns the whole parsed body. Use it when the body is not a plain
 *  `{ data }` envelope — GET /sessions also carries `meta`. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = readToken()

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  // FormData sets its own Content-Type with the multipart boundary, so it must
  // not be set by hand here.
  if (options.json !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
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
    // out as a guest. The login modal reopens from the 401 itself.
    if (response.status === 401 && token) clearToken()
    throw await toApiError(response)
  }

  // 204 from /logout and DELETE /holds/{id} has no body to parse.
  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}

/** Returns `body.data`, which is the shape of almost every endpoint. */
export async function requestData<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const body = await request<Envelope<T>>(path, options)
  return body.data
}
