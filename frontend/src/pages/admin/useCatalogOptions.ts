import { useQuery } from '@tanstack/react-query'
import { fetchDirections } from '@/api/directions'
import { fetchUniversities } from '@/api/universities'

/** All universities / directions for admin selects (the API caps a page at 100 rows). */
export function useCatalogOptions() {
  const universities = useQuery({ queryKey: ['options', 'universities'], queryFn: () => fetchUniversities({ size: 100 }) })
  const directions = useQuery({ queryKey: ['options', 'directions'], queryFn: () => fetchDirections({ size: 100 }) })
  return {
    universities: [...(universities.data?.content ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    directions: [...(directions.data?.content ?? [])].sort((a, b) => a.code.localeCompare(b.code)),
    ready: universities.isSuccess && directions.isSuccess,
  }
}
