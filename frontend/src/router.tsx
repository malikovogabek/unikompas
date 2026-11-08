import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { AdminLayout as AdminShell } from '@/components/layout/AdminLayout'
import { ApplicantLayout as ApplicantShell } from '@/components/layout/ApplicantLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { RouteError } from '@/components/layout/RouteError'
import { Skeleton } from '@/components/ui/Skeleton'
import { HomePage } from '@/pages/HomePage'

/**
 * Every page except the landing page is code-split: the initial bundle stays small and heavy
 * dependencies (Recharts, admin forms) load only on the routes that use them.
 */
function page(load: () => Promise<{ default: ComponentType }>): Pick<RouteObject, 'lazy'> {
  return { lazy: async () => ({ Component: (await load()).default }) }
}

const fallback = (
  <div className="mx-auto max-w-[1200px] px-4 py-10">
    <Skeleton className="h-96 rounded-lg" />
  </div>
)

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: fallback,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', ...page(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))) },
          { path: 'register', ...page(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))) },
        ],
      },
      { path: 'universities', ...page(() => import('@/pages/universities/UniversitiesPage').then((m) => ({ default: m.UniversitiesPage }))) },
      { path: 'universities/:id', ...page(() => import('@/pages/universities/UniversityDetailPage').then((m) => ({ default: m.UniversityDetailPage }))) },
      { path: 'directions', ...page(() => import('@/pages/directions/DirectionsPage').then((m) => ({ default: m.DirectionsPage }))) },
      { path: 'directions/:id', ...page(() => import('@/pages/directions/DirectionDetailPage').then((m) => ({ default: m.DirectionDetailPage }))) },
      { path: 'programs/:id', ...page(() => import('@/pages/programs/ProgramPage').then((m) => ({ default: m.ProgramPage }))) },
      { path: 'calculator', ...page(() => import('@/pages/CalculatorPage').then((m) => ({ default: m.CalculatorPage }))) },
      {
        element: (
          <ProtectedRoute role="APPLICANT">
            <ApplicantShell />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', ...page(() => import('@/pages/applicant/DashboardPage').then((m) => ({ default: m.DashboardPage }))) },
          { path: 'profile', ...page(() => import('@/pages/applicant/ProfilePage').then((m) => ({ default: m.ProfilePage }))) },
          { path: 'test', ...page(() => import('@/pages/applicant/CareerTestPage').then((m) => ({ default: m.CareerTestPage }))) },
          { path: 'test/result', ...page(() => import('@/pages/applicant/TestResultPage').then((m) => ({ default: m.TestResultPage }))) },
          { path: 'recommendations', ...page(() => import('@/pages/applicant/RecommendationsPage').then((m) => ({ default: m.RecommendationsPage }))) },
          { path: 'favorites', ...page(() => import('@/pages/applicant/FavoritesPage').then((m) => ({ default: m.FavoritesPage }))) },
          { path: 'compare', ...page(() => import('@/pages/applicant/ComparePage').then((m) => ({ default: m.ComparePage }))) },
        ],
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute role="ADMIN">
            <AdminShell />
          </ProtectedRoute>
        ),
        children: [
          { index: true, ...page(() => import('@/pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage }))) },
          { path: 'universities', ...page(() => import('@/pages/admin/AdminUniversitiesPage').then((m) => ({ default: m.AdminUniversitiesPage }))) },
          { path: 'directions', ...page(() => import('@/pages/admin/AdminDirectionsPage').then((m) => ({ default: m.AdminDirectionsPage }))) },
          { path: 'programs', ...page(() => import('@/pages/admin/AdminProgramsPage').then((m) => ({ default: m.AdminProgramsPage }))) },
          { path: 'import', ...page(() => import('@/pages/admin/AdminImportPage').then((m) => ({ default: m.AdminImportPage }))) },
          { path: 'settings', ...page(() => import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))) },
          { path: 'users', ...page(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))) },
        ],
      },
      { path: '*', ...page(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))) },
    ],
  },
])
