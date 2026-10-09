import { Link } from 'react-router-dom'

/** "NOW PLAYING" / "COMING SOON…" with the brand-red "See all" pushed to the
 *  right, as drawn. The heading is uppercase in the design, so the markup keeps
 *  normal casing and lets CSS do it — screen readers then read a word, not a
 *  shout. */
export function SectionHeader({ title, seeAllTo }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="text-xl font-extrabold tracking-wide uppercase">{title}</h2>
      {seeAllTo && (
        <Link
          to={seeAllTo}
          className="text-sm font-semibold text-brand transition-opacity hover:opacity-80"
        >
          See all
        </Link>
      )}
    </div>
  )
}
