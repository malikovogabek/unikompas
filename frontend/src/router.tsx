import { createBrowserRouter } from 'react-router'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { ApplicantLayout } from '@/components/layout/ApplicantLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminDirectionsPage } from '@/pages/admin/AdminDirectionsPage'
import { AdminImportPage } from '@/pages/admin/AdminImportPage'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminProgramsPage } from '@/pages/admin/AdminProgramsPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { AdminUniversitiesPage } from '@/pages/admin/AdminUniversitiesPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { CareerTestPage } from '@/pages/applicant/CareerTestPage'
import { ComparePage } from '@/pages/applicant/ComparePage'
import { DashboardPage } from '@/pages/applicant/DashboardPage'
import { FavoritesPage } from '@/pages/applicant/FavoritesPage'
import { ProfilePage } from '@/pages/applicant/ProfilePage'
import { RecommendationsPage } from '@/pages/applicant/RecommendationsPage'
import { TestResultPage } from '@/pages/applicant/TestResultPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { CalculatorPage } from '@/pages/CalculatorPage'
import { DirectionDetailPage } from '@/pages/directions/DirectionDetailPage'
import { DirectionsPage } from '@/pages/directions/DirectionsPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProgramPage } from '@/pages/programs/ProgramPage'
import { UniversitiesPage } from '@/pages/universities/UniversitiesPage'
import { UniversityDetailPage } from '@/pages/universities/UniversityDetailPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      { path: 'universities', element: <UniversitiesPage /> },
      { path: 'universities/:id', element: <UniversityDetailPage /> },
      { path: 'directions', element: <DirectionsPage /> },
      { path: 'directions/:id', element: <DirectionDetailPage /> },
      { path: 'programs/:id', element: <ProgramPage /> },
      { path: 'calculator', element: <CalculatorPage /> },
      {
        element: (
          <ProtectedRoute role="APPLICANT">
            <ApplicantLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'test', element: <CareerTestPage /> },
          { path: 'test/result', element: <TestResultPage /> },
          { path: 'recommendations', element: <RecommendationsPage /> },
          { path: 'favorites', element: <FavoritesPage /> },
          { path: 'compare', element: <ComparePage /> },
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
          { index: true, element: <AdminOverviewPage /> },
          { path: 'universities', element: <AdminUniversitiesPage /> },
          { path: 'directions', element: <AdminDirectionsPage /> },
          { path: 'programs', element: <AdminProgramsPage /> },
          { path: 'import', element: <AdminImportPage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
          { path: 'users', element: <AdminUsersPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
