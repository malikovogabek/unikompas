import type { PageResponse, Program, University, UniversityDetails, UniversityType } from '@/types/api'
import { api } from './client'

export type UniversityFilters = {
  search?: string
  regionId?: number
  type?: UniversityType
  page?: number
  size?: number
}

export const universityKeys = {
  list: (f: UniversityFilters) => ['universities', f] as const,
  detail: (id: number) => ['university', id] as const,
  programs: (id: number, page: number) => ['university', id, 'programs', page] as const,
}

export async function fetchUniversities(f: UniversityFilters): Promise<PageResponse<University>> {
  return (await api.get<PageResponse<University>>('/universities', { params: f })).data
}

export async function fetchUniversity(id: number): Promise<UniversityDetails> {
  return (await api.get<UniversityDetails>(`/universities/${id}`)).data
}

export async function fetchUniversityPrograms(id: number, page: number): Promise<PageResponse<Program>> {
  return (await api.get<PageResponse<Program>>(`/universities/${id}/programs`, { params: { page, size: 20 } })).data
}
