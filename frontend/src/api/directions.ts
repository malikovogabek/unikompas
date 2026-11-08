import type { Direction, DirectionDetails, PageResponse, Program } from '@/types/api'
import { api } from './client'

export type DirectionFilters = {
  search?: string
  fieldId?: number
  subjectId1?: number
  subjectId2?: number
  page?: number
  size?: number
}

export const directionKeys = {
  list: (f: DirectionFilters) => ['directions', f] as const,
  detail: (id: number) => ['direction', id] as const,
  programs: (id: number, page: number) => ['direction', id, 'programs', page] as const,
}

export async function fetchDirections(f: DirectionFilters): Promise<PageResponse<Direction>> {
  return (await api.get<PageResponse<Direction>>('/directions', { params: f })).data
}

export async function fetchDirection(id: number): Promise<DirectionDetails> {
  return (await api.get<DirectionDetails>(`/directions/${id}`)).data
}

export async function fetchDirectionPrograms(id: number, page: number): Promise<PageResponse<Program>> {
  return (await api.get<PageResponse<Program>>(`/directions/${id}/programs`, { params: { page, size: 20 } })).data
}
