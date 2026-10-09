/** Centres content in the 1920px frame, applies the page inset, and leaves
 *  room for the floating navbar. Uses px-rail (78px), the same inset as every
 *  other page's content, so a <Page> route lines up with the home and sessions
 *  pages. Only the navbar and footer sit at px-gutter (68px) — that 10px
 *  difference is in the Figma, not an accident. Used by every route except the home hero,
 *  which is full-bleed and sits under the navbar on purpose. */

export function Page({ title, subtitle, children }) {
  return (
    <div className="mx-auto w-content px-rail pt-navbar pb-20">
      {title && (
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-2 text-base text-ink-muted">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  )
}
