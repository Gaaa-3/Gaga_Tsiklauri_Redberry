import { QueryClient } from '@tanstack/react-query'

/** One shared client. Reference data like /filter-options rarely changes, so a
 *  generous staleTime keeps us from refetching it on every mount. */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
