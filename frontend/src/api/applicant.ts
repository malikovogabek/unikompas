import type {
  CareerQuestion,
  PageResponse,
  Profile,
  ProfileUpdateRequest,
  Program,
  Recommendation,
  RecommendationSummary,
  TestResult,
} from '@/types/api'
import { api } from './client'

/** Query keys of the signed-in applicant (the cache is cleared on every session change). */
export const applicantKeys = {
  profile: ['profile'] as const,
  questions: ['career-test', 'questions'] as const,
  latestTest: ['career-test', 'latest'] as const,
  latestRecommendation: ['recommendations', 'latest'] as const,
  recommendation: (id: number) => ['recommendations', id] as const,
  history: (page: number) => ['recommendations', 'history', page] as const,
  favorites: (page: number) => ['favorites', page] as const,
  favoriteIds: ['favorites', 'ids'] as const,
  compare: (ids: number[]) => ['compare', ids] as const,
}

export async function fetchProfile(): Promise<Profile> {
  return (await api.get<Profile>('/profile/me')).data
}

export async function saveProfile(body: ProfileUpdateRequest): Promise<Profile> {
  return (await api.put<Profile>('/profile/me', body)).data
}

export async function fetchQuestions(): Promise<CareerQuestion[]> {
  return (await api.get<CareerQuestion[]>('/career-test/questions')).data
}

export async function submitTest(answers: { questionId: number; value: number }[]): Promise<TestResult> {
  return (await api.post<TestResult>('/career-test/submit', { answers })).data
}

/** Latest test result, or null if the applicant has not taken the test yet. */
export async function fetchLatestTest(): Promise<TestResult | null> {
  const res = await api.get<TestResult>('/career-test/results/latest', { validateStatus: (s) => s === 200 || s === 404 })
  return res.status === 404 ? null : res.data
}

export async function generateRecommendation(): Promise<Recommendation> {
  return (await api.post<Recommendation>('/recommendations')).data
}

/** Latest recommendation, or null if none was generated yet. */
export async function fetchLatestRecommendation(): Promise<Recommendation | null> {
  const res = await api.get<Recommendation>('/recommendations/latest', { validateStatus: (s) => s === 200 || s === 404 })
  return res.status === 404 ? null : res.data
}

export async function fetchRecommendationHistory(page: number): Promise<PageResponse<RecommendationSummary>> {
  return (await api.get<PageResponse<RecommendationSummary>>('/recommendations', { params: { page, size: 10 } })).data
}

export async function fetchFavorites(page: number, size = 20): Promise<PageResponse<Program>> {
  return (await api.get<PageResponse<Program>>('/favorites', { params: { page, size } })).data
}

export async function addFavorite(programId: number): Promise<void> {
  await api.put(`/favorites/${programId}`)
}

export async function removeFavorite(programId: number): Promise<void> {
  await api.delete(`/favorites/${programId}`)
}

export async function fetchCompare(ids: number[]): Promise<Program[]> {
  return (await api.get<Program[]>('/programs/compare', { params: { ids: ids.join(',') } })).data
}
