import { QueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
})

// Any change of session (logout, expiry, another user signing in) drops all cached server
// data, so one user's data is never shown to the next.
useAuthStore.subscribe((state, prev) => {
  if (state.token !== prev.token) {
    queryClient.clear()
  }
})
