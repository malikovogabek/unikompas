import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthResponse, User } from '@/types/api'

type AuthState = {
  token: string | null
  expiresAt: string | null
  user: User | null
  setSession: (auth: AuthResponse) => void
  setUser: (user: User) => void
  logout: () => void
}

/**
 * The only global client state (CLAUDE.md §7.6). Persisted to localStorage so a reload
 * keeps the session. Expiry is enforced on load, in {@link selectIsAuthenticated} and by a
 * timer in SessionSync while the tab stays open.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      expiresAt: null,
      user: null,
      setSession: (auth) => set({ token: auth.accessToken, expiresAt: auth.expiresAt, user: auth.user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, expiresAt: null, user: null }),
    }),
    {
      name: 'unikompas.auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && isExpired(state.expiresAt)) {
          state.logout()
        }
      },
    },
  ),
)

export function isExpired(expiresAt: string | null): boolean {
  return expiresAt !== null && Date.parse(expiresAt) <= Date.now()
}

export const selectIsAuthenticated = (s: AuthState) => s.token !== null && s.user !== null && !isExpired(s.expiresAt)
