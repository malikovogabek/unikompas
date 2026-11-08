import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminHomePage } from '@/pages/admin/AdminHomePage'
import { DashboardPage } from '@/pages/applicant/DashboardPage'
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
        path: 'dashboard',
        element: (
          <ProtectedRoute role="APPLICANT">
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute role="ADMIN">
            <AdminHomePage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
