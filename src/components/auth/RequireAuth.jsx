import { useEffect } from 'react'
import { useAuth } from '../../auth/useAuth'
import { Page } from '../layout/Page'

/** Wraps a route that needs an account. Landing on it as a guest opens the login
 *  modal, and because the modal is global, signing in simply flips `status` and
 *  the real page renders underneath — no redirect, no second click. */
export function RequireAuth({ children }) {
  const { status, isReady, openLogin } = useAuth()

  useEffect(() => {
    if (status === 'guest') openLogin()
  }, [status, openLogin])

  // Boot: a stored token is still being exchanged for /me. Showing the signed
  // out state here would flash "please log in" at someone who is logged in.
  if (!isReady) {
    return (
      <Page title="My Profile">
        <div className="h-40 w-full max-w-xl animate-pulse rounded-2xl bg-surface" />
      </Page>
    )
  }

  if (status === 'guest') {
    return (
      <Page title="My Profile" subtitle="You need an account to see this page.">
        <button
          type="button"
          onClick={openLogin}
          className="h-11 rounded-full bg-brand px-6 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          Log in
        </button>
      </Page>
    )
  }

  return children
}
