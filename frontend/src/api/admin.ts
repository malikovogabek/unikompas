import type {
  Direction,
  DirectionDetails,
  DirectionRequest,
  ImportReport,
  PageResponse,
  Program,
  ProgramRequest,
  Role,
  ScoreHistoryItem,
  Stats,
  University,
  UniversityDetails,
  UniversityRequest,
  User,
  Weights,
} from '@/types/api'
import { api } from './client'

export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  universities: (search: string, page: number) => ['admin', 'universities', search, page] as const,
  directions: (search: string, page: number) => ['admin', 'directions', search, page] as const,
  programs: (universityId: number | undefined, directionId: number | undefined, page: number) =>
    ['admin', 'programs', universityId, directionId, page] as const,
  weights: ['admin', 'weights'] as const,
  users: (search: string, role: Role | '', sort: UserSort, page: number) => ['admin', 'users', search, role, sort, page] as const,
}

export const fetchStats = async () => (await api.get<Stats>('/admin/stats')).data

export const fetchAdminUniversities = async (search: string, page: number) =>
  (await api.get<PageResponse<University>>('/admin/universities', { params: { search: search || undefined, page, size: 20 } })).data
export const fetchUniversityForEdit = async (id: number) => (await api.get<UniversityDetails>(`/universities/${id}`)).data
export const createUniversity = async (body: UniversityRequest) => (await api.post<UniversityDetails>('/admin/universities', body)).data
export const updateUniversity = async (id: number, body: UniversityRequest) =>
  (await api.put<UniversityDetails>(`/admin/universities/${id}`, body)).data
export const deleteUniversity = async (id: number) => {
  await api.delete(`/admin/universities/${id}`)
}

export const fetchAdminDirections = async (search: string, page: number) =>
  (await api.get<PageResponse<Direction>>('/admin/directions', { params: { search: search || undefined, page, size: 20 } })).data
export const fetchDirectionForEdit = async (id: number) => (await api.get<DirectionDetails>(`/directions/${id}`)).data
export const createDirection = async (body: DirectionRequest) => (await api.post<DirectionDetails>('/admin/directions', body)).data
export const updateDirection = async (id: number, body: DirectionRequest) =>
  (await api.put<DirectionDetails>(`/admin/directions/${id}`, body)).data
export const deleteDirection = async (id: number) => {
  await api.delete(`/admin/directions/${id}`)
}

export const fetchAdminPrograms = async (universityId: number | undefined, directionId: number | undefined, page: number) =>
  (await api.get<PageResponse<Program>>('/admin/programs', { params: { universityId, directionId, page, size: 20 } })).data
export const createProgram = async (body: ProgramRequest) => (await api.post<Program>('/admin/programs', body)).data
export const updateProgram = async (id: number, body: ProgramRequest) => (await api.put<Program>(`/admin/programs/${id}`, body)).data
export const deleteProgram = async (id: number) => {
  await api.delete(`/admin/programs/${id}`)
}
export const replaceScores = async (id: number, scores: ScoreHistoryItem[]) =>
  (await api.put<Program>(`/admin/programs/${id}/passing-scores`, scores)).data

export async function importPassingScores(file: File): Promise<ImportReport> {
  const form = new FormData()
  form.append('file', file)
  return (await api.post<ImportReport>('/admin/import/passing-scores', form)).data
}

export const fetchWeights = async () => (await api.get<Weights>('/admin/settings/recommendation-weights')).data
export const saveWeights = async (w: Weights) => (await api.put<Weights>('/admin/settings/recommendation-weights', w)).data

export type UserSort = 'createdAt' | 'lastSeenAt'

export const fetchUsers = async (search: string, role: Role | '', sort: UserSort, page: number) =>
  (
    await api.get<PageResponse<User>>('/admin/users', {
      params: { search: search || undefined, role: role || undefined, sort: `${sort},desc`, page, size: 20 },
    })
  ).data
