/** /register, /login, /logout, /me. Both register and login hand back a token
 *  plus the user, so there is no separate login step after signing up. */

import { requestData, request } from '../lib/http'
import type { AuthResponse, User } from '../types/api'

export interface LoginInput {
  email: string
  password: string
}

/** 401 here means wrong credentials: keep the modal open, keep the email, and
 *  show the API's own message inside it. */
export function login(input: LoginInput) {
  return requestData<AuthResponse>('/login', { method: 'POST', json: input })
}

export interface RegisterInput {
  username: string
  email: string
  password: string
  passwordConfirmation: string
  avatar?: File | null
}

/** multipart, because of the optional avatar. Note the one snake_case field in
 *  the whole API: password_confirmation. */
export function register(input: RegisterInput) {
  const form = new FormData()
  form.append('username', input.username)
  form.append('email', input.email)
  form.append('password', input.password)
  form.append('password_confirmation', input.passwordConfirmation)
  if (input.avatar) form.append('avatar', input.avatar)

  return requestData<AuthResponse>('/register', { method: 'POST', form })
}

/** 204, no body. */
export function logout() {
  return request<void>('/logout', { method: 'POST' })
}

/** Called on boot whenever a token is already stored, to get the current user
 *  back (and with it profileComplete and the derived age). */
export function getMe() {
  return requestData<User>('/me')
}
