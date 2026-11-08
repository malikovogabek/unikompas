import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { homePathFor } from '@/lib/routes'
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore'
import type { Role } from '@/types/api'

type ProtectedRouteProps = { role?: Role; children: ReactNode }

/**
 * Guards a route: guests go to /login (and come back afterwards); a user with the wrong
 * role is sent to their own home page.
 */
export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const location = useLocation()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />
  }
  if (role && user?.role !== role) {
    return <Navigate to={homePathFor(user?.role)} replace />
  }
  return children
}
