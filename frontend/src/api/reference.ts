import type { RefItem } from '@/types/api'
import { api } from './client'

export const referenceKeys = {
  regions: ['regions'] as const,
  subjects: ['subjects'] as const,
  fields: ['fields'] as const,
}

export async function fetchRegions(): Promise<RefItem[]> {
  return (await api.get<RefItem[]>('/regions')).data
}

export async function fetchSubjects(): Promise<RefItem[]> {
  return (await api.get<RefItem[]>('/subjects')).data
}

export async function fetchFields(): Promise<RefItem[]> {
  return (await api.get<RefItem[]>('/fields')).data
}
