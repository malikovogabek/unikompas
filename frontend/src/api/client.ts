import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { ApiError } from '@/types/api'

/** Shared axios instance. Components never call axios directly — only src/api/* modules do. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 15_000,
})

// Backend data is language-independent (the client translates codes), so no Accept-Language
// header is sent and query keys do not need the language.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // An expired/invalid session on a protected call: drop it so guards redirect to /login —
    // but only if the request was sent with the *current* token (a late 401 from an old token
    // must not end a fresh session).
    const current = useAuthStore.getState().token
    const sentWith = String(error.config?.headers?.Authorization ?? '')
    if (error.response?.status === 401 && current && sentWith === `Bearer ${current}` && !isAuthCall(error)) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

function isAuthCall(error: AxiosError): boolean {
  const url = error.config?.url ?? ''
  return url.includes('/auth/login') || url.includes('/auth/register')
}

/** Extracts the backend ApiError (if any) from an unknown thrown value. */
export function toApiError(err: unknown): ApiError | null {
  if (axios.isAxiosError<ApiError>(err) && err.response?.data && typeof err.response.data.error === 'string') {
    return err.response.data
  }
  return null
}

export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response
}
