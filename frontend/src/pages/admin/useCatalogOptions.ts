import { useQuery } from '@tanstack/react-query'
import { fetchDirections } from '@/api/directions'
import { fetchUniversities } from '@/api/universities'
import type { PageResponse } from '@/types/api'

/** Loads every page (the API caps a page at 100 rows) so selects always contain the full list. */
async function fetchAll<T>(fetchPage: (page: number) => Promise<PageResponse<T>>): Promise<T[]> {
  const first = await fetchPage(0)
  const rest = await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, i) => fetchPage(i + 1)))
  return [first, ...rest].flatMap((p) => p.content)
}

/** All universities / directions for admin selects and filters. */
export function useCatalogOptions() {
  const universities = useQuery({
    queryKey: ['options', 'universities'],
    queryFn: () => fetchAll((page) => fetchUniversities({ page, size: 100 })),
  })
  const directions = useQuery({
    queryKey: ['options', 'directions'],
    queryFn: () => fetchAll((page) => fetchDirections({ page, size: 100 })),
  })
  return {
    universities: [...(universities.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    directions: [...(directions.data ?? [])].sort((a, b) => a.code.localeCompare(b.code)),
    ready: universities.isSuccess && directions.isSuccess,
    error: universities.error ?? directions.error,
    retry: () => {
      void universities.refetch()
      void directions.refetch()
    },
  }
}
