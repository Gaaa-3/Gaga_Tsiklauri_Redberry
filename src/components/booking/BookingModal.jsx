import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { useFilterOptions } from '../../hooks/useFilterOptions'
import {
  formatCountdown,
  useCountdown,
  useCreateOrder,
  useHoldSeats,
  useReleaseHold,
  useSeatMap,
} from '../../hooks/useBooking'
import { ApiError } from '../../lib/http'
import { ErrorRetry } from '../ui/ErrorRetry'
import { FormMessage } from '../ui/FormMessage'
import { Modal } from '../ui/Modal'
import { CheckoutForm } from './CheckoutForm'
import { Confirmation } from './Confirmation'
import { SeatMap } from './SeatMap'
import { SeatSummary } from './SeatSummary'

/** Two steps: seats, then checkout. Reuses the shared <Modal> so the backdrop,
 *  ESC, overlay-click and focus trap behave the same as the auth modals. */
export function BookingModal({ session, movie, onClose }) {
  const { user } = useAuth()
  const options = useFilterOptions()
  const seatMap = useSeatMap(session.id)
  const hold = useHoldSeats(session.id)
  const release = useReleaseHold()
  const order = useCreateOrder()
  const queryClient = useQueryClient()

  const [step, setStep] = useState('seats')
  const [selected, setSelected] = useState([])
  const [ticketTypeBySeat, setTicketTypeBySeat] = useState({})
  const [heldHold, setHeldHold] = useState(null)
  const [paidOrder, setPaidOrder] = useState(null)
  const [notice, setNotice] = useState(null)

  const remaining = useCountdown(heldHold?.expiresAt)
  const expired = Boolean(heldHold) && remaining <= 0

  const maxSeats = options.data?.maxSeatsPerOrder ?? 1
  const ticketTypes = options.data?.ticketTypes ?? []
  const basePrice = session.price
  const minAge = movie?.ageRating?.minAge ?? 0

  const subtotal =
    Math.round(
      selected.reduce((sum, seat) => {
        const slug = ticketTypeBySeat[seat.id] ?? 'adult'
        const type = ticketTypes.find((item) => item.slug === slug)
        return sum + basePrice * (type?.priceRatio ?? 1)
      }, 0) * 100,
    ) / 100

  /** Closing without paying must give the seats back rather than leaving them
   *  locked for the rest of the 8 minutes — someone else is trying to book
   *  them. Stepping back to the seat list does NOT release: that is still an
   *  active booking. */
  function onCloseModal() {
    if (heldHold?.holdId && !paidOrder) {
      release.mutate(heldHold.holdId)
    }
    onClose()
  }

  function toggleSeat(seat) {
    setNotice(null)
    setSelected((current) => {
      if (current.some((item) => item.id === seat.id)) {
        return current.filter((item) => item.id !== seat.id)
      }
      if (current.length >= maxSeats) {
        setNotice(`You can book at most ${maxSeats} seats in one order.`)
        return current
      }
      return [...current, seat]
    })
  }

  async function onNext() {
    setNotice(null)
    try {
      const result = await hold.mutateAsync(
        selected.map((seat) => ({
          // seat.id, never seat.code — the API rejects codes.
          seatId: seat.id,
          ticketType: ticketTypeBySeat[seat.id] ?? 'adult',
        })),
      )
      setHeldHold(result)
      setStep('checkout')
    } catch (error) {
      handleContested(error)
    }
  }

  /** 409: someone paid for one of these seats first. `contested` names them —
   *  drop just those, KEEP THE REST OF THE SELECTION, and refetch the map so
   *  the taken seats repaint as sold. */
  function handleContested(error) {
    if (error instanceof ApiError && error.status === 409 && error.contested?.length) {
      const taken = new Set(error.contested)
      setSelected((current) => current.filter((seat) => !taken.has(seat.code)))
      void seatMap.refetch()
      setNotice(
        `${error.contested.join(', ')} ${error.contested.length === 1 ? 'was' : 'were'} taken while you were choosing. The rest of your selection is still here.`,
      )
      setStep('seats')
      setHeldHold(null)
      return
    }
    setNotice(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.')
  }

  const header = (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="truncate text-xs text-ink-muted">
          {session.venue.name} · Hall {session.hall.name} · {session.date} · {session.time} ·{' '}
          {session.format.name} · {session.language.name}
        </p>
      </div>
      {heldHold && !paidOrder && (
        <div className="shrink-0 rounded-lg bg-surface px-3 py-1.5 text-center">
          <p className="text-[9px] font-bold tracking-[0.12em] text-ink-dim uppercase">
            Seats held
          </p>
          <p className={`text-sm font-extrabold ${remaining <= 60 ? 'text-brand' : ''}`}>
            {formatCountdown(remaining)}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <Modal
      title={movie?.title ?? session.movie?.title ?? 'Book tickets'}
      onClose={onCloseModal}
      widthClass="w-[1100px]"
    >
      {header}

      {paidOrder ? (
        <div className="mt-6">
          <Confirmation order={paidOrder} onClose={onClose} />
        </div>
      ) : (
        <>
          <div className="mt-5 flex gap-2 rounded-full bg-surface p-1">
            <StepTab active={step === 'seats'} label="1. Seats" />
            <StepTab active={step === 'checkout'} label="2. Checkout" />
          </div>

          {expired && (
            <div className="mt-5">
              <FormMessage>
                Your hold ran out and the seats were released. Pick them again to continue.
              </FormMessage>
            </div>
          )}

          {notice && (
            <div className="mt-5">
              <FormMessage>{notice}</FormMessage>
            </div>
          )}

          {step === 'seats' ? (
            <div className="mt-6 flex gap-8">
              <div className="min-w-0 flex-1">
                {seatMap.isPending && (
                  <div className="h-[420px] animate-pulse rounded-2xl bg-surface" />
                )}
                {seatMap.isError && (
                  <ErrorRetry
                    message={
                      seatMap.error instanceof ApiError
                        ? seatMap.error.message
                        : 'Could not load the hall.'
                    }
                    onRetry={() => void seatMap.refetch()}
                    retrying={seatMap.isFetching}
                  />
                )}
                {seatMap.data && (
                  <SeatMap
                    map={seatMap.data}
                    selectedIds={selected.map((seat) => seat.id)}
                    onToggle={toggleSeat}
                    disabled={hold.isPending}
                  />
                )}
              </div>

              <div className="flex w-[300px] shrink-0 flex-col">
                <SeatSummary
                  seats={selected}
                  ticketTypes={ticketTypes}
                  ticketTypeBySeat={ticketTypeBySeat}
                  onChangeTicketType={(seatId, slug) =>
                    setTicketTypeBySeat((current) => ({ ...current, [seatId]: slug }))
                  }
                  basePrice={basePrice}
                  maxSeats={maxSeats}
                  movieMinAge={minAge}
                />

                <button
                  type="button"
                  onClick={onNext}
                  disabled={selected.length === 0 || hold.isPending || !user?.profileComplete}
                  className="mt-5 h-11 w-full rounded-full text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:bg-control disabled:text-ink-muted enabled:bg-brand enabled:hover:opacity-90"
                >
                  {hold.isPending ? 'Holding seats…' : 'Next: Checkout'}
                </button>

                {!user?.profileComplete && (
                  <p className="mt-2 text-center text-[11px] text-brand">
                    Complete your profile to book.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex gap-8">
              <div className="min-w-0 flex-1">
                <CheckoutForm
                  user={user}
                  holdId={heldHold?.holdId}
                  subtotal={subtotal}
                  createOrder={(input) => order.mutateAsync(input)}
                  onPaid={(created, error) => {
                    if (error) {
                      handleContested(error)
                      return
                    }
                    setPaidOrder(created)
                    // Those seats are sold now and there is a new order: both
                    // the hall map and My Tickets would otherwise be stale.
                    queryClient.invalidateQueries({ queryKey: ['seats', session.id] })
                    queryClient.invalidateQueries({ queryKey: ['tickets'] })
                  }}
                />
              </div>

              <div className="w-[300px] shrink-0 rounded-2xl bg-surface p-5">
                <p className="text-sm font-bold">Your seats</p>
                <ul className="mt-3 space-y-2">
                  {heldHold?.seats?.map((seat) => (
                    <li key={seat.seatId} className="flex justify-between text-xs">
                      <span className="font-semibold">
                        {seat.code}
                        <span className="ml-2 font-normal text-ink-muted capitalize">
                          {seat.ticketType}
                        </span>
                      </span>
                      <span className="font-semibold">₾{seat.price}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-line/60 pt-4">
                  <span className="text-xs text-ink-muted">Total</span>
                  <span className="text-lg font-extrabold">₾{heldHold?.subtotal ?? subtotal}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('seats')}
                  className="mt-4 h-10 w-full rounded-full bg-surface-raised text-xs font-semibold transition-colors hover:bg-control"
                >
                  Back to seats
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

function StepTab({ active, label }) {
  return (
    <span
      aria-current={active ? 'step' : undefined}
      className={`flex-1 rounded-full py-2 text-center text-xs font-bold transition-colors ${
        active ? 'bg-brand text-ink' : 'text-ink-muted'
      }`}
    >
      {label}
    </span>
  )
}
