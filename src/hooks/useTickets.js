import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTickets, refundOrder } from '../api/tickets'

/** `filter` is 'upcoming' or 'past' — the two tabs on My Tickets. */
export function useTickets(filter) {
  return useQuery({
    queryKey: ['tickets', filter],
    queryFn: () => getTickets(filter),
  })
}

export function useRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: refundOrder,
    // A refund changes the order AND frees seats, so both lists are refetched
    // rather than patched locally.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  })
}
