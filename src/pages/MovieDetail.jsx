import { useParams } from 'react-router-dom'
import { Page } from '../components/layout/Page'

export function MovieDetailPage() {
  const { slug } = useParams()
  return (
    <Page title="Movie" subtitle={slug}>
      <p className="text-ink-muted">Coming in the movie detail commit.</p>
    </Page>
  )
}
