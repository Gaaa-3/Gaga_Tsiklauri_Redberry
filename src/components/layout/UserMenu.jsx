import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { initials } from '../../lib/initials'

/** The signed-in half of the navbar: an avatar tile carrying the profile
 *  completeness dot, the first name, and a dropdown.
 *
 *  The dot is the whole point of the design — amber while the profile is
 *  incomplete, green once it is — because an incomplete profile is what blocks
 *  booking, and the user needs to see that before they reach the checkout. */

export function UserMenu({ user }) {
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const rootRef = useRef(null)
  // Close on a click anywhere else and on ESCAPE, so the menu never gets
  // stranded open behind a navigation.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])
  const firstName = (user.fullName ?? user.username).trim().split(/\s+/)[0]
  const dotColour = user.profileComplete ? 'bg-available' : 'bg-warning'
  async function onSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      setOpen(false)
    } finally {
      setSigningOut(false)
    }
  }
  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3"
      >
        <Avatar user={user} className="size-11" dotClass={dotColour} />
        <span className="text-sm font-bold">{firstName}</span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`size-4 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="m6 9 6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+12px)] right-0 w-[336px] rounded-3xl bg-page p-5 shadow-2xl shadow-black/60"
        >
          <div className="flex items-center gap-4">
            <Avatar user={user} className="size-14" dotClass={dotColour} />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{user.fullName ?? user.username}</p>
              <p className="truncate text-sm text-ink-muted">{user.email}</p>
            </div>
          </div>

          {!user.profileComplete && (
            <div className="mt-5 rounded-xl bg-warning/10 p-4">
              <p className="font-bold text-warning">Profile incomplete</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                Please complete your profile to enable booking
              </p>
            </div>
          )}

          <nav className="mt-5 flex flex-col">
            <MenuLink to="/profile" onNavigate={() => setOpen(false)} label="My Profile">
              <path
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </MenuLink>
            <MenuLink
              to="/profile?tab=tickets"
              onNavigate={() => setOpen(false)}
              label="My Tickets"
            >
              <path
                d="M3 9.5V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2.5a2.5 2.5 0 0 0 0-5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </MenuLink>
          </nav>

          <div className="mt-4 border-t border-line pt-4">
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-3 rounded-xl px-1 py-2 font-bold text-brand transition-colors hover:bg-surface disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
                <path
                  d="M10 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-2M4 12h10m0 0-3-3m3 3-3 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {signingOut ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** The rounded-square avatar, falling back to initials when there is no picture,
 *  with the completeness dot pinned to its bottom-right corner. */

function Avatar({ user, className, dotClass }) {
  return (
    <span className={`relative shrink-0 ${className}`}>
      {user.avatar ? (
        <img src={user.avatar} alt="" className="size-full rounded-xl bg-surface object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center rounded-xl bg-surface text-sm font-bold">
          {initials(user.fullName ?? user.username)}
        </span>
      )}
      <span
        aria-hidden="true"
        className={`absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-page ${dotClass}`}
      />
    </span>
  )
}

function MenuLink({ to, label, onNavigate, children }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl px-1 py-2.5 font-bold transition-colors hover:bg-surface"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 text-ink-muted">
        {children}
      </svg>
      {label}
    </Link>
  )
}
