import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFavorite, applicantKeys, fetchFavorites, removeFavorite } from '@/api/applicant'
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore'

/**
 * Set of saved programme ids (first 100) for heart toggles, plus a toggle mutation.
 * Only active for signed-in applicants.
 */
export function useFavorites() {
  const qc = useQueryClient()
  const enabled = useAuthStore((s) => selectIsAuthenticated(s) && s.user?.role === 'APPLICANT')
  const query = useQuery({
    queryKey: applicantKeys.favoriteIds,
    queryFn: async () => new Set((await fetchFavorites(0, 100)).content.map((p) => p.id)),
    enabled,
  })
  const toggle = useMutation({
    mutationFn: ({ id, saved }: { id: number; saved: boolean }) => (saved ? removeFavorite(id) : addFavorite(id)),
    onSettled: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })
  const ids = query.data ?? new Set<number>()
  return {
    enabled,
    isSaved: (id: number) => ids.has(id),
    toggle: (id: number) => toggle.mutate({ id, saved: ids.has(id) }),
    pendingId: toggle.isPending ? toggle.variables?.id : undefined,
  }
}
