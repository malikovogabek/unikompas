import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { warmUpServer } from '@/api/client'
import { SessionSync } from '@/components/layout/SessionSync'
import '@/i18n'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import '@/styles/index.css'

// Start a sleeping free-tier backend immediately, before the user's first real request.
warmUpServer()

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
