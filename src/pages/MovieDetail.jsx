import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Page } from '../components/layout/Page'
import { notifyRecentlyViewedChanged } from '../hooks/useRecentlyViewed'
import { pushRecentlyViewed } from '../lib/recentlyViewed'

export function MovieDetailPage() {
  const { slug } = useParams()

  // Opening a film is what puts it in "Recently viewed" on the home page — for
  // guests as well as signed-in users. This records it; the rest of the page
  // arrives with the movie detail slice.
  useEffect(() => {
    if (!slug) return
    pushRecentlyViewed(slug)
    notifyRecentlyViewedChanged()
  }, [slug])

  return (
    <Page title="Movie" subtitle={slug}>
      <p className="text-ink-muted">Coming in the movie detail commit.</p>
    </Page>
  )
}
