import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMe, login, logout, register } from '../api/auth'
import { clearToken, readToken, writeToken } from '../lib/token'
import { AuthContext } from './context'

/** Holds the signed-in user and owns the login/register modals, because the
 *  things that open them (the navbar, a protected action, a 401) are scattered
 *  all over the tree and all need the same single instance. */

export function AuthProvider({ children }) {
  // A stored token means we boot into 'loading' and ask /me who it belongs to.
  const [status, setStatus] = useState(() => (readToken() ? 'loading' : 'guest'))
  const [user, setUser] = useState(null)
  const [modal, setModal] = useState(null)
  useEffect(() => {
    if (!readToken()) return
    let cancelled = false
    getMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setStatus('authed')
      })
      .catch(() => {
        // The token was rejected or the API is down. http.ts has already dropped
        // a rejected token; either way this session continues as a guest.
        if (cancelled) return
        clearToken()
        setUser(null)
        setStatus('guest')
      })
    return () => {
      cancelled = true
    }
  }, [])
  const openLogin = useCallback(() => setModal('login'), [])
  const openRegister = useCallback(() => setModal('register'), [])
  const closeModal = useCallback(() => setModal(null), [])
  /** Both /login and /register answer with a token AND the user, so there is no
   *  second round trip to /me after either of them. */
  const adopt = useCallback((token, me) => {
    writeToken(token)
    setUser(me)
    setStatus('authed')
    setModal(null)
  }, [])
  const signIn = useCallback(
    async (input) => {
      const { token, user: me } = await login(input)
      adopt(token, me)
    },
    [adopt],
  )
  const signUp = useCallback(
    async (input) => {
      const { token, user: me } = await register(input)
      adopt(token, me)
    },
    [adopt],
  )
  const signOut = useCallback(async () => {
    try {
      await logout()
    } catch {
      // The token was already dead server-side. Signing out locally is still
      // the correct outcome, so this failure is deliberately swallowed.
    }
    clearToken()
    setUser(null)
    setStatus('guest')
  }, [])
  const value = useMemo(
    () => ({
      user,
      status,
      isReady: status !== 'loading',
      modal,
      openLogin,
      openRegister,
      closeModal,
      signIn,
      signUp,
      signOut,
    }),
    [user, status, modal, openLogin, openRegister, closeModal, signIn, signUp, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
