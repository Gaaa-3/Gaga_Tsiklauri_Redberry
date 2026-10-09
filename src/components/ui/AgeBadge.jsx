/** The age rating chip — "12+", "16+". Not a flat colour: the design is the
 *  brand red at 10% opacity over the page, with the code itself in full brand
 *  red. The rating's own description text is used as the tooltip, because the
 *  API writes it for the user ("Restricted to viewers aged 16 and over…"). */
export function AgeBadge({ rating, className = '' }) {
  if (!rating) return null

  return (
    <span
      title={rating.description}
      className={`inline-flex h-6 shrink-0 items-center rounded-md bg-brand/10 px-2 text-xs font-bold text-brand ${className}`}
    >
      {rating.code}
    </span>
  )
}
