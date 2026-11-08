import type { Program, ScoreCalculationRequest, ScoreCalculationResponse } from '@/types/api'
import { api } from './client'

export const programKeys = {
  detail: (id: number) => ['program', id] as const,
}

export async function fetchProgram(id: number): Promise<Program> {
  return (await api.get<Program>(`/programs/${id}`)).data
}

export async function calculateScore(body: ScoreCalculationRequest): Promise<ScoreCalculationResponse> {
  return (await api.post<ScoreCalculationResponse>('/score/calculate', body)).data
}
