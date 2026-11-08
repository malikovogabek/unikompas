import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { SessionSync } from '@/components/layout/SessionSync'
import '@/i18n'
import { router } from '@/router'
import '@/styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
})

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found')
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionSync />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
