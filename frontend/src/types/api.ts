/**
 * TypeScript mirrors of backend DTOs (uz.unikompas.*.dto). Keep in sync with Swagger:
 * http://localhost:8080/v3/api-docs
 */

export type Role = 'APPLICANT' | 'ADMIN'

export type User = {
  id: number
  fullName: string
  email: string
  role: Role
  createdAt: string
}

export type AuthResponse = {
  accessToken: string
  tokenType: 'Bearer'
  expiresAt: string
  user: User
}

export type LoginRequest = { email: string; password: string }
export type RegisterRequest = { fullName: string; email: string; password: string }

/** Uniform error body (TZ §8). `error` is translated via `errors.<code>`. */
export type ApiError = {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  /** field → constraint name, translated via `validation.<code>` */
  fieldErrors?: Record<string, string>
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type RefItem = { id: number; code: string; name: string; icon?: string }

// ---------------------------------------------------------------- catalog

export type UniversityType = 'STATE' | 'PRIVATE' | 'FOREIGN_BRANCH'
export type StudyLanguage = 'UZ' | 'RU' | 'EN'
export type StudyForm = 'FULL_TIME' | 'PART_TIME' | 'EVENING' | 'DISTANCE'

export type University = {
  id: number
  name: string
  shortName: string | null
  region: RefItem
  city: string | null
  type: UniversityType
  rating: number
  hasDormitory: boolean
  logoUrl: string | null
}

export type UniversityDetails = University & {
  address: string | null
  website: string | null
  foundedYear: number | null
  description: string | null
  programCount: number
}

export type Direction = {
  id: number
  code: string
  name: string
  field: RefItem
  firstSubject: RefItem
  secondSubject: RefItem
}

export type RiasecProfile = { r: number; i: number; a: number; s: number; e: number; c: number }

export type DirectionDetails = Direction & {
  riasec: RiasecProfile
  hollandCode: string
  description: string | null
  careerProspects: string | null
  programCount: number
}

export type ScoreHistoryItem = { year: number; grantScore: number | null; contractScore: number | null }

export type Program = {
  id: number
  university: University
  direction: Direction
  language: StudyLanguage
  studyForm: StudyForm
  grantQuota: number
  contractQuota: number
  contractFee: number
  durationYears: number
  latestScores: ScoreHistoryItem | null
  scoreHistory: ScoreHistoryItem[]
}

export type ScoreCalculationRequest = {
  mandatoryCorrect: number
  firstSubjectCorrect: number
  secondSubjectCorrect: number
}

export type ScoreCalculationResponse = {
  mandatoryScore: number
  firstSubjectScore: number
  secondSubjectScore: number
  total: number
  maxTotal: number
}
