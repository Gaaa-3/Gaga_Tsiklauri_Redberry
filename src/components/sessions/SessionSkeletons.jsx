/** The sessions page must use SKELETONS rather than a full-page spinner — it is
 *  called out specifically in the brief, and it is the right call anyway: the
 *  filter rail stays put and only the results area redraws. */

export function SessionGroupSkeleton() {
  return (
    <div className="animate-pulse border-t border-line/40 py-7 first:border-t-0">
      <div className="flex items-center gap-4">
        <div className="h-[86px] w-[60px] shrink-0 rounded-lg bg-surface" />
        <div>
          <div className="h-5 w-48 rounded bg-surface" />
          <div className="mt-2 h-3 w-20 rounded bg-surface" />
        </div>
      </div>
      <div className="mt-4 flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-[132px] w-[220px] shrink-0 rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <aside className="h-fit w-[290px] shrink-0 animate-pulse rounded-2xl bg-surface p-6">
      <div className="h-5 w-20 rounded bg-surface-raised" />
      {Array.from({ length: 4 }, (_, group) => (
        <div key={group} className="mt-7">
          <div className="h-3 w-16 rounded bg-surface-raised" />
          <div className="mt-3 space-y-2.5">
            {Array.from({ length: 4 }, (_, row) => (
              <div key={row} className="h-4 w-full rounded bg-surface-raised" />
            ))}
          </div>
        </div>
      ))}
    </aside>
  )
}
