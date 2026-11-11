import { queryClient } from '@/lib/queryClient'
import type { AuthResponse } from '@/types/api'
import { selectIsAuthenticated, useAuthStore } from './authStore'

const session = (expiresInMs: number, token = 'tok'): AuthResponse => ({
  accessToken: token,
  tokenType: 'Bearer',
  expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
  user: { id: 1, fullName: 'Test', email: 't@x.uz', role: 'APPLICANT', createdAt: new Date().toISOString(), lastSeenAt: null, loginCount: 0 },
})

describe('auth store', () => {
  afterEach(() => useAuthStore.getState().logout())

  it('treats an expired session as signed out', () => {
    useAuthStore.getState().setSession(session(-1000))
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false)
    useAuthStore.getState().setSession(session(60_000))
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true)
  })

  it('clears cached server data when the session changes', () => {
    useAuthStore.getState().setSession(session(60_000, 'a'))
    queryClient.setQueryData(['favorites'], ['user A data'])
    useAuthStore.getState().logout()
    expect(queryClient.getQueryData(['favorites'])).toBeUndefined()
  })
})
