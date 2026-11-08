import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from './ProtectedRoute'

function LoginProbe() {
  const state = useLocation().state as { from?: string } | null
  return <p>login from {state?.from}</p>
}

describe('ProtectedRoute', () => {
  it('keeps query and hash in the return path', () => {
    useAuthStore.getState().logout()
    render(
      <MemoryRouter initialEntries={['/dashboard?tab=favorites#top']}>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route path="/dashboard" element={<ProtectedRoute role="APPLICANT">secret</ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('login from /dashboard?tab=favorites#top')).toBeInTheDocument()
  })

  it('sends a user with the wrong role to their own home', () => {
    useAuthStore.setState({
      token: 't',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: { id: 1, fullName: 'A', email: 'a@x.uz', role: 'ADMIN', createdAt: '' },
    })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/admin" element={<p>admin home</p>} />
          <Route path="/dashboard" element={<ProtectedRoute role="APPLICANT">secret</ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('admin home')).toBeInTheDocument()
  })
})
