/** /register, /login, /logout, /me. Both register and login hand back a token
 *  plus the user, so there is no separate login step after signing up. */
import { requestData, request } from '../lib/http'

/** 401 here means wrong credentials: keep the modal open, keep the email, and
 *  show the API's own message inside it. */

export function login(input) {
  return requestData('/login', { method: 'POST', json: input })
}

/** multipart, because of the optional avatar. Note the one snake_case field in
 *  the whole API: password_confirmation. */

export function register(input) {
  const form = new FormData()
  form.append('username', input.username)
  form.append('email', input.email)
  form.append('password', input.password)
  form.append('password_confirmation', input.passwordConfirmation)
  if (input.avatar) form.append('avatar', input.avatar)
  return requestData('/register', { method: 'POST', form })
}

/** 204, no body. */

export function logout() {
  return request('/logout', { method: 'POST' })
}

/** Called on boot whenever a token is already stored, to get the current user
 *  back (and with it profileComplete and the derived age). */

export function getMe() {
  return requestData('/me')
}
