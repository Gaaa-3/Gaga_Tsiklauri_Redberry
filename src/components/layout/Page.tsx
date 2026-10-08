import type { ReactNode } from 'react'

interface PageProps {
  /** Rendered as the h1, with the design's heading size and weight. */
  title?: string
  /** The muted line under the title. */
  subtitle?: string
  children: ReactNode
}

/** Centres content in the 1920px frame, applies the page gutter, and leaves
 *  room for the floating navbar. Used by every route except the home hero,
 *  which is full-bleed and sits under the navbar on purpose. */
export function Page({ title, subtitle, children }: PageProps) {
  return (
    <div className="mx-auto w-content px-gutter pt-navbar pb-20">
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
