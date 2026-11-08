import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchMe } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

/**
 * Keeps the session honest while the app is open:
 * - refreshes the stored user from /auth/me once per load (login seeds the cache, so no
 *   extra call right after signing in); an invalid token is cleared by the 401 interceptor;
 * - logs out exactly when the token expires, even if no request is made.
 */
export function SessionSync() {
  const token = useAuthStore((s) => s.token)
  const expiresAt = useAuthStore((s) => s.expiresAt)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMe, enabled: token !== null, staleTime: Infinity })
  useEffect(() => {
    if (data) {
      setUser(data)
    }
  }, [data, setUser])

  useEffect(() => {
    if (!expiresAt) {
      return
    }
    const ms = Date.parse(expiresAt) - Date.now()
    if (ms <= 0) {
      logout()
      return
    }
    // setTimeout caps at ~24.8 days; tokens live 24h.
    const id = window.setTimeout(logout, Math.min(ms, 2_147_483_647))
    return () => window.clearTimeout(id)
  }, [expiresAt, logout])

  return null
}
