import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchMe } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

/**
 * Refreshes the stored user from /auth/me once per app load when a token exists,
 * so name/role changes are picked up and an invalid token is cleared (via the 401 interceptor).
 */
export function SessionSync() {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)
  const { data } = useQuery({ queryKey: ['me', token], queryFn: fetchMe, enabled: token !== null, staleTime: Infinity })
  useEffect(() => {
    if (data) {
      setUser(data)
    }
  }, [data, setUser])
  return null
}
