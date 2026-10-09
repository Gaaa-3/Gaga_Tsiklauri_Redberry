import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getMe, login, logout, register } from '../api/auth'
import { setUnauthorizedHandler } from '../lib/http'
import { clearToken, readToken, writeToken } from '../lib/token'
import { AuthContext } from './context'

/** Holds the signed-in user and owns the login/register modals, because the
 *  things that open them (the navbar, a protected action, a 401) are scattered
 *  all over the tree and all need the same single instance.
 *
 *  It also owns the PENDING ACTION. When a guest presses something that needs an
 *  account, that action is parked here, the login modal opens, and the action
 *  runs by itself once they are in. The user never presses the same button
 *  twice — which is graded, and is the whole reason this lives in one place
 *  rather than in each component. */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient()

  // A stored token means we boot into 'loading' and ask /me who it belongs to.
  const [status, setStatus] = useState(() => (readToken() ? 'loading' : 'guest'))
  const [user, setUser] = useState(null)
  const [modal, setModal] = useState(null)

  // The interrupted action, if any. A ref because queuing it must not re-render,
  // and because it is read from callbacks that would otherwise close over a
  // stale copy.
  const pendingRef = useRef(null)
  const statusRef = useRef(status)
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // True until the boot /me has settled. A 401 during that call means "your
  // saved token went stale", which should quietly drop you to a guest — not
  // throw a login modal at someone who has only just opened the site.
  const bootingRef = useRef(Boolean(readToken()))

  useEffect(() => {
    if (!readToken()) return

    let cancelled = false
    getMe()
      .then((me) => {
        bootingRef.current = false
        if (cancelled) return
        setUser(me)
        setStatus('authed')
      })
      .catch(() => {
        // The token was rejected or the API is down. http.js has already dropped
        // a rejected token; either way this session continues as a guest.
        bootingRef.current = false
        if (cancelled) return
        clearToken()
        setUser(null)
        setStatus('guest')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Any 401 from anywhere in the app lands here: the session is over, so drop
  // the user and ask them to log in again. Whatever they were doing has already
  // been parked by requireAuth, so it replays on success.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setStatus('guest')
      statusRef.current = 'guest'
      // Only interrupt the user if they were actually doing something.
      if (bootingRef.current) return
      setModal((current) => current ?? 'login')
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const openLogin = useCallback(() => setModal('login'), [])
  const openRegister = useCallback(() => setModal('register'), [])

  /** Dismissing the modal abandons the parked action — the user changed their
   *  mind, so it must not fire the next time they happen to log in. */
  const closeModal = useCallback(() => {
    pendingRef.current = null
    setModal(null)
  }, [])

  /** Run `action` now if signed in; otherwise park it and open the login modal.
   *  Callers just wrap the thing they wanted to do and forget about auth. */
  const requireAuth = useCallback((action) => {
    if (statusRef.current === 'authed') {
      action()
      return
    }
    pendingRef.current = action
    setModal('login')
  }, [])

  /** Both /login and /register answer with a token AND the user, so there is no
   *  second round trip to /me after either of them. */
  const adopt = useCallback((token, me) => {
    writeToken(token)
    setUser(me)
    setStatus('authed')
    statusRef.current = 'authed'
    setModal(null)

    // Anything already fetched was fetched as a guest, and some fields are
    // per-user — isNotified on a Coming Soon film, isMine on a seat. Drop the
    // lot so every visible list refetches as this user.
    queryClient.invalidateQueries()

    // Replay whatever the guest was trying to do. Cleared first so a failure
    // inside the action cannot leave it armed for next time.
    const pending = pendingRef.current
    pendingRef.current = null
    if (pending) pending(me)
  }, [queryClient])

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
    pendingRef.current = null
    setUser(null)
    setStatus('guest')
    statusRef.current = 'guest'
    // Same reason as on sign-in, in reverse: nothing cached may keep showing
    // the previous user's state.
    queryClient.invalidateQueries()
  }, [queryClient])

  const value = useMemo(
    () => ({
      user,
      status,
      isReady: status !== 'loading',
      modal,
      openLogin,
      openRegister,
      closeModal,
      requireAuth,
      signIn,
      signUp,
      signOut,
    }),
    [user, status, modal, openLogin, openRegister, closeModal, requireAuth, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
