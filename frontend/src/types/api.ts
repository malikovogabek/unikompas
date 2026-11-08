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
