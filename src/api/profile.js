/** PUT /profile. multipart, because of the optional avatar.
 *  The 422 `errors` strings are the exact wording the brief asks for, so they
 *  are shown as returned — we never write our own copies of them. */
import { requestData } from '../lib/http'

/** `email` is fixed at registration and cannot be changed — sending it is
 *  ignored rather than rejected, so it is simply left out.
 *  The response carries the derived `age` and the refreshed `profileComplete`. */

export function updateProfile(input) {
  const form = new FormData()
  form.append('fullName', input.fullName)
  form.append('mobileNumber', input.mobileNumber)
  form.append('dateOfBirth', input.dateOfBirth)
  if (input.preferredVenueId != null) {
    form.append('preferredVenueId', String(input.preferredVenueId))
  }
  if (input.avatar) form.append('avatar', input.avatar)
  return requestData('/profile', { method: 'PUT', form })
}
