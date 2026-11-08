import { createBrowserRouter, Navigate, type LazyRouteFunction, type RouteObject } from 'react-router'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ApplicantLayout } from '@/components/layout/ApplicantLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RouteError } from '@/components/layout/RouteError'
import { Skeleton } from '@/components/ui/Skeleton'
import { homePathFor } from '@/lib/routes'
import { HomePage } from '@/pages/HomePage'
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore'
import type { Role } from '@/types/api'

/**
 * Every page except the landing page is code-split; Recharts and admin forms load only where used.
 * For protected pages the role check runs BEFORE the chunk is requested, so guests are redirected
 * to /login without downloading admin code (and a stale chunk cannot turn a redirect into an error).
 */
function guarded(role: Role, lazy: LazyRouteFunction<RouteObject>): LazyRouteFunction<RouteObject> {
  return async () => {
    const state = useAuthStore.getState()
    if (!selectIsAuthenticated(state)) {
      const from = window.location.pathname + window.location.search + window.location.hash
      return { Component: () => <Navigate to="/login" replace state={{ from }} /> }
    }
    if (state.user?.role !== role) {
      return { Component: () => <Navigate to={homePathFor(state.user?.role)} replace /> }
    }
    return lazy()
  }
}

const pageFallback = (
  <div className="mx-auto max-w-[1200px] px-4 py-10">
    <Skeleton className="h-96 rounded-lg" />
  </div>
)

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        // Errors and first-load fallbacks render INSIDE the layout, so header, footer and the
        // #main landmark stay on screen.
        errorElement: <RouteError />,
        hydrateFallbackElement: pageFallback,
        children: [
          { index: true, element: <HomePage /> },
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', lazy: () => import('@/pages/auth/LoginPage').then((m) => ({ Component: m.LoginPage })) },
              { path: 'register', lazy: () => import('@/pages/auth/RegisterPage').then((m) => ({ Component: m.RegisterPage })) },
            ],
          },
          { path: 'universities', lazy: () => import('@/pages/universities/UniversitiesPage').then((m) => ({ Component: m.UniversitiesPage })) },
          { path: 'universities/:id', lazy: () => import('@/pages/universities/UniversityDetailPage').then((m) => ({ Component: m.UniversityDetailPage })) },
          { path: 'directions', lazy: () => import('@/pages/directions/DirectionsPage').then((m) => ({ Component: m.DirectionsPage })) },
          { path: 'directions/:id', lazy: () => import('@/pages/directions/DirectionDetailPage').then((m) => ({ Component: m.DirectionDetailPage })) },
          { path: 'programs/:id', lazy: () => import('@/pages/programs/ProgramPage').then((m) => ({ Component: m.ProgramPage })) },
          { path: 'calculator', lazy: () => import('@/pages/CalculatorPage').then((m) => ({ Component: m.CalculatorPage })) },
          {
            element: (
              <ProtectedRoute role="APPLICANT">
                <ApplicantLayout />
              </ProtectedRoute>
            ),
            children: [
              { path: 'dashboard', lazy: guarded('APPLICANT', () => import('@/pages/applicant/DashboardPage').then((m) => ({ Component: m.DashboardPage }))) },
              { path: 'profile', lazy: guarded('APPLICANT', () => import('@/pages/applicant/ProfilePage').then((m) => ({ Component: m.ProfilePage }))) },
              { path: 'test', lazy: guarded('APPLICANT', () => import('@/pages/applicant/CareerTestPage').then((m) => ({ Component: m.CareerTestPage }))) },
              { path: 'test/result', lazy: guarded('APPLICANT', () => import('@/pages/applicant/TestResultPage').then((m) => ({ Component: m.TestResultPage }))) },
              { path: 'recommendations', lazy: guarded('APPLICANT', () => import('@/pages/applicant/RecommendationsPage').then((m) => ({ Component: m.RecommendationsPage }))) },
              { path: 'favorites', lazy: guarded('APPLICANT', () => import('@/pages/applicant/FavoritesPage').then((m) => ({ Component: m.FavoritesPage }))) },
              { path: 'compare', lazy: guarded('APPLICANT', () => import('@/pages/applicant/ComparePage').then((m) => ({ Component: m.ComparePage }))) },
            ],
          },
          {
            path: 'admin',
            element: (
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            ),
            children: [
              { index: true, lazy: guarded('ADMIN', () => import('@/pages/admin/AdminOverviewPage').then((m) => ({ Component: m.AdminOverviewPage }))) },
              { path: 'universities', lazy: guarded('ADMIN', () => import('@/pages/admin/AdminUniversitiesPage').then((m) => ({ Component: m.AdminUniversitiesPage }))) },
              { path: 'directions', lazy: guarded('ADMIN', () => import('@/pages/admin/AdminDirectionsPage').then((m) => ({ Component: m.AdminDirectionsPage }))) },
              { path: 'programs', lazy: guarded('ADMIN', () => import('@/pages/admin/AdminProgramsPage').then((m) => ({ Component: m.AdminProgramsPage }))) },
              { path: 'import', lazy: guarded('ADMIN', () => import('@/pages/admin/AdminImportPage').then((m) => ({ Component: m.AdminImportPage }))) },
              { path: 'settings', lazy: guarded('ADMIN', () => import('@/pages/admin/AdminSettingsPage').then((m) => ({ Component: m.AdminSettingsPage }))) },
              { path: 'users', lazy: guarded('ADMIN', () => import('@/pages/admin/AdminUsersPage').then((m) => ({ Component: m.AdminUsersPage }))) },
            ],
          },
          { path: '*', lazy: () => import('@/pages/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })) },
        ],
      },
    ],
  },
])
