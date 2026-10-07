import { Link, NavLink } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="border-b border-neutral-800">
      <nav className="mx-auto flex h-20 w-content items-center justify-between px-12">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          KINO<span className="text-amber-400">XII</span>
        </Link>

        <div className="flex items-center gap-8">
          <NavLink
            to="/sessions"
            className={({ isActive }) =>
              isActive ? 'text-amber-400' : 'text-neutral-300 hover:text-white'
            }
          >
            Sessions
          </NavLink>
          {/* Auth controls land in commit 4. */}
          <span className="text-neutral-600">Log in</span>
          <span className="text-neutral-600">Sign up</span>
        </div>
      </nav>
    </header>
  )
}
