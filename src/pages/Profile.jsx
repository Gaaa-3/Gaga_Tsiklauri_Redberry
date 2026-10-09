import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { MyTickets } from '../components/profile/MyTickets'
import { ProfileForm } from '../components/profile/ProfileForm'
import { Page } from '../components/layout/Page'

/** Personal information and My Tickets.
 *
 *  The tab lives in the URL so the confirmation screen can link straight to
 *  /profile?tab=tickets after a booking, and so a refresh keeps you where you
 *  were. */
export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'tickets' ? 'tickets' : 'information'

  if (!user) return null

  return (
    <Page title="My Profile">
      {!user.profileComplete && (
        <div className="mb-8 max-w-xl rounded-xl bg-warning/10 p-4">
          <p className="font-bold text-warning">Profile incomplete</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Add your full name, mobile number and date of birth to enable booking.
          </p>
        </div>
      )}

      <div className="flex w-fit gap-2 rounded-full bg-surface p-1">
        {[
          ['information', 'Information'],
          ['tickets', 'My Tickets'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSearchParams(value === 'tickets' ? { tab: 'tickets' } : {})}
            aria-current={tab === value ? 'true' : undefined}
            className={`rounded-full px-6 py-2 text-xs font-bold transition-colors ${
              tab === value ? 'bg-brand text-ink' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'information' ? (
          <ProfileForm user={user} onSaved={refreshUser} />
        ) : (
          <MyTickets />
        )}
      </div>
    </Page>
  )
}
