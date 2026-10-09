import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { UserMenu } from './UserMenu'

/** Sits on top of the page rather than in a band of its own: on the home page
 *  it floats over the hero image, so it carries a soft top-down shade instead
 *  of a solid background, exactly as in the design. */

export function Navbar() {
  const { user, status, openLogin, openRegister } = useAuth()
  return (
    <header className="absolute inset-x-0 top-0 z-30 h-navbar bg-gradient-to-b from-black/45 to-transparent">
      <nav className="mx-auto flex h-navbar w-content items-center gap-10 px-gutter">
        <Link to="/" className="text-xl font-extrabold tracking-wide">
          KINO <span className="text-brand">XII</span>
        </Link>

        <NavLink
          to="/sessions"
          className={({ isActive }) =>
            `text-sm font-semibold tracking-widest uppercase transition-colors ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
          }
        >
          Sessions
        </NavLink>

        <div className="ml-auto flex items-center gap-4">
          <SearchField />

          {/* 'loading' is the brief moment on boot while a stored token is
            exchanged for /me. Rendering the guest buttons during it would
            make the navbar flicker from "Log in" to the user's name on every
            refresh, so it holds a same-sized blank instead. */}
          {status === 'loading' && <div className="h-11 w-44" />}

          {status === 'guest' && (
            <>
              <button
                type="button"
                onClick={openRegister}
                className="h-11 rounded-full bg-brand px-6 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={openLogin}
                className="h-11 rounded-full bg-white px-6 text-sm font-semibold text-page transition-opacity hover:opacity-90"
              >
                Log in
              </button>
            </>
          )}

          {status === 'authed' && user && <UserMenu user={user} />}
        </div>
      </nav>
    </header>
  )
}

/** Styling only for now; the typeahead that opens the results overlay is wired
 *  up when the search commit lands. */

function SearchField() {
  return (
    <div className="relative w-[420px]">
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-dim"
      >
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12.8 12.8 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        placeholder="Search films and live events"
        aria-label="Search films and live events"
        className="h-11 w-full rounded-full bg-surface pr-4 pl-11 text-sm text-ink placeholder:text-ink-dim"
      />
    </div>
  )
}
