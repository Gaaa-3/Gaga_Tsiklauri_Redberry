import { Link } from 'react-router-dom'
import { Page } from '../components/layout/Page'

export function NotFoundPage() {
  return (
    <Page title="Page not found" subtitle="That link does not lead anywhere.">
      <Link
        to="/"
        className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold"
      >
        Back to home
      </Link>
    </Page>
  )
}
