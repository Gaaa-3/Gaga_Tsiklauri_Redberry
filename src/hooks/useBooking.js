import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { createOrder, holdSeats, releaseHold } from '../api/booking'
import { getSeatMap } from '../api/sessions'

/** The hall map for one session. Sending a token also fills in `isMine`, which
 *  is how a selection survives a reload, so this must not be cached for long —
 *  seats are sold by other people while you look at them. */
export function useSeatMap(sessionId) {
  return useQuery({
    queryKey: ['seats', sessionId],
    queryFn: () => getSeatMap(sessionId),
    enabled: Boolean(sessionId),
    staleTime: 0,
    gcTime: 0,
  })
}

export function useHoldSeats(sessionId) {
  return useMutation({ mutationFn: (seats) => holdSeats(sessionId, seats) })
}

export function useCreateOrder() {
  return useMutation({ mutationFn: createOrder })
}

export function useReleaseHold() {
  return useMutation({ mutationFn: releaseHold })
}

/** Seconds left on a hold, counted down from the server's `expiresAt`.
 *
 *  Driven off the absolute timestamp rather than by subtracting one per second:
 *  a backgrounded tab throttles timers, so a decrementing counter drifts and
 *  would still read "3:12" on a hold that expired minutes ago. Recomputing the
 *  difference each tick is always right, however badly the timer is throttled. */
export function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(() => secondsUntil(expiresAt))

  // Resetting during render rather than from an effect: a new hold must show
  // its full 8:00 immediately, and doing it in an effect would paint the old
  // hold's number for a frame first. This is React's documented way to adjust
  // state when a prop changes.
  const [seenExpiry, setSeenExpiry] = useState(expiresAt)
  if (seenExpiry !== expiresAt) {
    setSeenExpiry(expiresAt)
    setRemaining(secondsUntil(expiresAt))
  }

  useEffect(() => {
    if (!expiresAt) return

    const timer = setInterval(() => {
      const left = secondsUntil(expiresAt)
      setRemaining(left)
      if (left <= 0) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  return remaining
}

function secondsUntil(iso) {
  if (!iso) return 0
  const left = Math.ceil((new Date(iso).getTime() - Date.now()) / 1000)
  return Number.isFinite(left) && left > 0 ? left : 0
}

/** 465 -> "7:45" */
export function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
