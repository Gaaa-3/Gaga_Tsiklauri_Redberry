import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex h-24 w-content items-center justify-between px-gutter">
        <Link to="/" className="text-sm font-extrabold tracking-wide">
          KINO <span className="text-brand">XII</span>
        </Link>
        <p className="text-sm text-ink-dim">© 2026 Kino XII. All rights reserved.</p>
      </div>
    </footer>
  )
}
