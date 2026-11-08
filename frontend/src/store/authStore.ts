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
 * keeps the session; an expired token is discarded on load.
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
        if (state?.expiresAt && Date.parse(state.expiresAt) <= Date.now()) {
          state.logout()
        }
      },
    },
  ),
)

export const selectIsAuthenticated = (s: AuthState) => s.token !== null && s.user !== null
