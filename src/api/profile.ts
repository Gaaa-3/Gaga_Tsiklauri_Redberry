/** PUT /profile. multipart, because of the optional avatar.
 *  The 422 `errors` strings are the exact wording the brief asks for, so they
 *  are shown as returned — we never write our own copies of them. */

import { requestData } from '../lib/http'
import type { User } from '../types/api'

export interface ProfileInput {
  /** min 3, max 50. */
  fullName: string
  /** Georgian, 9 digits starting with 5. Spaces are stripped server-side. */
  mobileNumber: string
  /** YYYY-MM-DD. The user must be at least 12. */
  dateOfBirth: string
  preferredVenueId?: number | null
  avatar?: File | null
}

/** `email` is fixed at registration and cannot be changed — sending it is
 *  ignored rather than rejected, so it is simply left out.
 *  The response carries the derived `age` and the refreshed `profileComplete`. */
export function updateProfile(input: ProfileInput) {
  const form = new FormData()
  form.append('fullName', input.fullName)
  form.append('mobileNumber', input.mobileNumber)
  form.append('dateOfBirth', input.dateOfBirth)
  if (input.preferredVenueId != null) {
    form.append('preferredVenueId', String(input.preferredVenueId))
  }
  if (input.avatar) form.append('avatar', input.avatar)

  return requestData<User>('/profile', { method: 'PUT', form })
}
