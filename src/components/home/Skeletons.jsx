/** Placeholders shaped like the real thing, so the page does not jump when the
 *  data lands. Each mirrors the measured size of the card it stands in for. */

export function HeroSkeleton() {
  return (
    <div className="h-[800px] w-full animate-pulse bg-surface-muted">
      <div className="mx-auto flex h-full w-content flex-col justify-end px-rail pb-28">
        <div className="h-3 w-48 rounded bg-surface" />
        <div className="mt-5 h-14 w-[560px] rounded bg-surface" />
        <div className="mt-5 h-6 w-72 rounded bg-surface" />
        <div className="mt-6 h-16 w-[600px] rounded bg-surface" />
        <div className="mt-7 flex gap-3">
          <div className="h-11 w-40 rounded-full bg-surface" />
          <div className="h-11 w-36 rounded-full bg-surface" />
        </div>
      </div>
    </div>
  )
}

export function MovieCardSkeleton() {
  return (
    <div className="w-[290px] shrink-0 animate-pulse rounded-2xl bg-surface p-3.5">
      <div className="h-[333px] w-full rounded-xl bg-surface-raised" />
      <div className="mt-4 h-4 w-3/4 rounded bg-surface-raised" />
      <div className="mt-2 h-3 w-1/2 rounded bg-surface-raised" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-surface-raised" />
        <div className="h-9 w-24 rounded-full bg-surface-raised" />
      </div>
    </div>
  )
}

export function ComingSoonCardSkeleton() {
  return (
    <div className="flex w-[525px] shrink-0 animate-pulse gap-4 rounded-2xl bg-surface p-3.5">
      <div className="h-[150px] w-[200px] shrink-0 rounded-xl bg-surface-raised" />
      <div className="flex-1 py-1">
        <div className="h-3 w-32 rounded bg-surface-raised" />
        <div className="mt-3 h-4 w-40 rounded bg-surface-raised" />
        <div className="mt-2 h-3 w-24 rounded bg-surface-raised" />
        <div className="mt-6 h-9 w-28 rounded-full bg-surface-raised" />
      </div>
    </div>
  )
}

/** `count` placeholders in a row, matching the layout of the real section. */
export function CardRowSkeleton({ count = 6, variant = 'movie' }) {
  const Card = variant === 'coming-soon' ? ComingSoonCardSkeleton : MovieCardSkeleton
  return (
    <div className="mt-6 flex gap-[18px] overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} />
      ))}
    </div>
  )
}
