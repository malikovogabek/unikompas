import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFavorite, applicantKeys, fetchFavoriteIds, removeFavorite } from '@/api/applicant'
import { selectIsAuthenticated, useAuthStore } from '@/store/authStore'

/**
 * Set of all saved programme ids for heart toggles, plus a toggle mutation. The pending
 * state lasts until the refetch completes, so a fast second click sees the new state.
 * Only active for signed-in applicants.
 */
export function useFavorites() {
  const qc = useQueryClient()
  const enabled = useAuthStore((s) => selectIsAuthenticated(s) && s.user?.role === 'APPLICANT')
  const query = useQuery({
    queryKey: applicantKeys.favoriteIds,
    queryFn: async () => new Set(await fetchFavoriteIds()),
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
    toggle: (id: number) => {
      if (!toggle.isPending) {
        toggle.mutate({ id, saved: ids.has(id) })
      }
    },
    pendingId: toggle.isPending ? toggle.variables?.id : undefined,
  }
}
