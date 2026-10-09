import { createContext } from 'react'

/** The context object lives apart from the provider component so the provider
 *  file exports a component and nothing else, which is what React Fast Refresh
 *  (and eslint-plugin-react-refresh) wants.
 *
 * @typedef {'loading'|'guest'|'authed'} AuthStatus
 *   'loading' only happens on boot, while a stored token is exchanged for /me.
 * @typedef {'login'|'register'|null} AuthModal
 *
 * @typedef {object} AuthValue
 * @property {import('../types/api').User|null} user
 * @property {AuthStatus} status
 * @property {boolean} isReady True once /me has answered, or there was no token.
 * @property {AuthModal} modal
 * @property {() => void} openLogin
 * @property {() => void} openRegister
 * @property {() => void} closeModal Also abandons any parked action.
 * @property {(action: (user: import('../types/api').User) => void) => void} requireAuth
 *   Runs `action` straight away when signed in; otherwise parks it, opens the
 *   login modal, and runs it once the user is in. This is what stops anyone
 *   having to press the same button twice.
 * @property {(input: {email: string, password: string}) => Promise<void>} signIn
 * @property {(input: object) => Promise<void>} signUp
 * @property {() => Promise<void>} signOut
 */

/** @type {import('react').Context<AuthValue|null>} */
export const AuthContext = createContext(null)
