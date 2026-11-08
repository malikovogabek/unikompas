import { useQuery } from '@tanstack/react-query'
import { fetchFields, fetchRegions, fetchSubjects, referenceKeys } from '@/api/reference'

const STATIC = { staleTime: Infinity, gcTime: Infinity } as const

/** Reference lists rarely change: fetched once per session. */
export function useRegions() {
  return useQuery({ queryKey: referenceKeys.regions, queryFn: fetchRegions, ...STATIC })
}

export function useSubjects() {
  return useQuery({ queryKey: referenceKeys.subjects, queryFn: fetchSubjects, ...STATIC })
}

export function useFields() {
  return useQuery({ queryKey: referenceKeys.fields, queryFn: fetchFields, ...STATIC })
}
