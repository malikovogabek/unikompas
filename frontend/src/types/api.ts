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
  /** Last activity (sign-in or return with a session); null if never recorded. */
  lastSeenAt: string | null
  loginCount: number
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
  mandatoryMax: number
  firstSubjectMax: number
  secondSubjectMax: number
  total: number
  maxTotal: number
}

// ---------------------------------------------------------------- applicant

export type Financing = 'GRANT_ONLY' | 'CONTRACT_OK'

export type Profile = {
  region: RefItem | null
  firstSubject: RefItem | null
  secondSubject: RefItem | null
  expectedScore: number | null
  preferredLanguage: StudyLanguage | null
  preferredStudyForm: StudyForm | null
  financing: Financing
  maxContractFee: number | null
  willingToRelocate: boolean
  fields: RefItem[]
  complete: boolean
  updatedAt: string | null
}

export type ProfileUpdateRequest = {
  regionId: number
  firstSubjectId: number
  secondSubjectId: number
  expectedScore: number
  preferredLanguage: StudyLanguage | null
  preferredStudyForm: StudyForm | null
  financing: Financing
  maxContractFee: number | null
  willingToRelocate: boolean
  fieldIds: number[]
}

export type CareerQuestion = { id: number; orderNo: number; text: { uz: string; ru: string; en: string } }

export type TestResult = {
  id: number
  scores: { r: number; i: number; a: number; s: number; e: number; c: number }
  hollandCode: string
  createdAt: string
}

export type Category = 'SAFE' | 'TARGET' | 'REACH'

export type Reason = { code: string; params: Record<string, string | number> }

export type RecommendedProgram = {
  programId: number
  rank: number
  category: Category
  university: University
  direction: Direction
  language: StudyLanguage
  studyForm: StudyForm
  grantQuota: number
  contractQuota: number
  contractFee: number
  scores: {
    total: number
    interest: number
    chance: number
    preference: number
    rating: number
    grantChance: number | null
    contractChance: number | null
  }
  predictedGrantScore: number | null
  predictedContractScore: number | null
  reasons: Reason[]
}

export type DirectionMatch = {
  direction: Direction
  matchPercent: number
  interestPercent: number
  bestProgramId: number
  programCount: number
}

export type Weights = { interest: number; chance: number; preference: number; rating: number }

export type Recommendation = {
  id: number
  createdAt: string
  expectedScore: number
  usedCareerTest: boolean
  hollandCode: string | null
  weights: Weights
  totalMatches: number
  counts: Record<Category, number>
  topDirections: DirectionMatch[]
  programs: Record<Category, RecommendedProgram[]>
}

export type RecommendationSummary = { id: number; createdAt: string; totalMatches: number; counts: Record<Category, number> }

// ---------------------------------------------------------------- admin

export type Ranked = { id: number; code: string | null; name: string; count: number }

export type Stats = {
  applicants: number
  activeLast24h: number
  activeLast7d: number
  completeProfiles: number
  testAttempts: number
  applicantsWithTest: number
  recommendations: number
  catalog: { universities: number; directions: number; programs: number }
  topDirections: Ranked[]
  topUniversities: Ranked[]
  applicantsByRegion: Ranked[]
}

export type UniversityRequest = {
  name: string
  shortName: string
  regionId: number
  city: string
  address: string
  website: string
  type: UniversityType
  rating: number
  hasDormitory: boolean
  foundedYear: number | null
  description: string
  logoUrl: string
}

export type DirectionRequest = {
  code: string
  name: string
  fieldId: number
  firstSubjectId: number
  secondSubjectId: number
  riasec: RiasecProfile
  description: string
  careerProspects: string
}

export type ProgramRequest = {
  universityId: number
  directionId: number
  language: StudyLanguage
  studyForm: StudyForm
  grantQuota: number
  contractQuota: number
  contractFee: number
  durationYears: number
}

export type ImportReport = {
  totalRows: number
  created: number
  updated: number
  errors: { line: number; code: string; value: string }[]
}
