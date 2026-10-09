import { useMemo } from 'react'
import { ComingSoonCard } from '../components/home/ComingSoonCard'
import { Hero } from '../components/home/Hero'
import { MovieCard } from '../components/home/MovieCard'
import { RecentlyViewedRow } from '../components/home/RecentlyViewedRow'
import { SectionHeader } from '../components/home/SectionHeader'
import { CardRowSkeleton, HeroSkeleton } from '../components/home/Skeletons'
import { ErrorRetry } from '../components/ui/ErrorRetry'
import { useComingSoon, useFeatured, useNowPlaying } from '../hooks/useMovies'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import { ApiError } from '../lib/http'

/** Hero carousel, Recently viewed, Now Playing, Coming Soon.
 *
 *  Each section owns its own loading, error and empty state, so a slow or
 *  failing /coming-soon never stops the hero from rendering. */
export function HomePage() {
  const featured = useFeatured()
  const nowPlaying = useNowPlaying()
  const comingSoon = useComingSoon()
  const recentSlugs = useRecentlyViewed()

  // Recently viewed stores slugs only; the films themselves are matched out of
  // the two lists already fetched, so it costs no extra request.
  const moviesBySlug = useMemo(() => {
    const map = new Map()
    for (const movie of [...(nowPlaying.data ?? []), ...(comingSoon.data ?? [])]) {
      map.set(movie.slug, movie)
    }
    return map
  }, [nowPlaying.data, comingSoon.data])

  return (
    <>
      {featured.isPending && <HeroSkeleton />}

      {featured.isError && (
        <div className="mx-auto w-content px-rail pt-40 pb-16">
          <ErrorRetry
            message={errorMessage(featured.error)}
            onRetry={() => void featured.refetch()}
            retrying={featured.isFetching}
          />
        </div>
      )}

      {featured.data && <Hero movies={featured.data} />}

      <RecentlyViewedRow slugs={recentSlugs} moviesBySlug={moviesBySlug} />

      <MovieSection
        title="Now Playing"
        seeAllTo="/sessions"
        query={nowPlaying}
        emptyMessage="No films are playing right now. Please check back soon."
        renderCard={(movie) => <MovieCard key={movie.id} movie={movie} />}
      />

      <MovieSection
        title="Coming soon…"
        seeAllTo="/sessions"
        query={comingSoon}
        variant="coming-soon"
        emptyMessage="Nothing has been announced yet. Check back soon."
        renderCard={(movie) => <ComingSoonCard key={movie.id} movie={movie} />}
      />
    </>
  )
}

/** One horizontally scrolling row with its header, covering all four states:
 *  loading, failed-with-a-retry, empty, and loaded. */
function MovieSection({ title, seeAllTo, query, renderCard, emptyMessage, variant }) {
  const movies = query.data ?? []

  return (
    <section className="mx-auto w-content border-t border-line/40 px-rail py-12">
      <SectionHeader title={title} seeAllTo={seeAllTo} />

      {query.isPending && <CardRowSkeleton variant={variant} count={variant ? 4 : 6} />}

      {query.isError && (
        <div className="mt-6">
          <ErrorRetry
            message={errorMessage(query.error)}
            onRetry={() => void query.refetch()}
            retrying={query.isFetching}
          />
        </div>
      )}

      {query.data && movies.length === 0 && (
        <p className="mt-6 rounded-2xl bg-surface p-8 text-sm text-ink-muted">{emptyMessage}</p>
      )}

      {movies.length > 0 && (
        <div className="-mx-rail mt-6 flex gap-[18px] overflow-x-auto px-rail pb-3">
          {movies.map(renderCard)}
        </div>
      )}
    </section>
  )
}

function errorMessage(error) {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
}
