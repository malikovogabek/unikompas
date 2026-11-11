import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useServerStatusStore } from '@/store/serverStatusStore'
import type { ApiError } from '@/types/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

/**
 * The backend runs on a free instance that sleeps after inactivity and needs ~1.5 minutes to
 * start. Requests therefore wait long enough, transient failures are retried, and a request that
 * is slow raises a global "server is waking up" banner instead of an error.
 */
const REQUEST_TIMEOUT_MS = 60_000
const SLOW_AFTER_MS = 3_000
/** Back-off before each retry; together with the timeout this covers a full cold start. Mutable for tests. */
export const retryDelaysMs = [2_000, 4_000, 8_000, 15_000]
const RETRY_STATUSES = new Set([502, 503, 504])

type TrackedConfig = InternalAxiosRequestConfig & { _retries?: number; _slow?: { timer: number; counted: boolean } }

/** Shared axios instance. Components never call axios directly — only src/api/* modules do. */
export const api = axios.create({ baseURL: API_BASE_URL, timeout: REQUEST_TIMEOUT_MS })

api.interceptors.request.use((config: TrackedConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Start the slow-request timer once per logical request (retries reuse the same config).
  if (!config._slow) {
    const slow = { timer: 0, counted: false }
    slow.timer = window.setTimeout(() => {
      slow.counted = true
      useServerStatusStore.getState().begin()
    }, SLOW_AFTER_MS)
    config._slow = slow
  }
  return config
})

function settle(config: TrackedConfig | undefined) {
  if (!config?._slow) {
    return
  }
  window.clearTimeout(config._slow.timer)
  if (config._slow.counted) {
    useServerStatusStore.getState().end()
  }
  config._slow = undefined
}

/** No response at all (network error, timeout, CORS during spin-up) or a gateway error from the platform. */
function isTransient(error: AxiosError): boolean {
  if (error.code === AxiosError.ERR_CANCELED) {
    return false
  }
  return !error.response || RETRY_STATUSES.has(error.response.status)
}

api.interceptors.response.use(
  (response) => {
    settle(response.config as TrackedConfig)
    return response
  },
  async (error: AxiosError<ApiError>) => {
    const config = error.config as TrackedConfig | undefined
    const attempt = config?._retries ?? 0
    if (config && isTransient(error) && attempt < retryDelaysMs.length) {
      config._retries = attempt + 1
      await new Promise((resolve) => window.setTimeout(resolve, retryDelaysMs[attempt]))
      return api.request(config)
    }
    settle(config)

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

/**
 * Fire-and-forget request to the database-free health endpoint as soon as the app loads, so a
 * sleeping backend starts while the visitor is still reading or typing. Silent on purpose.
 */
export function warmUpServer(): void {
  void fetch(`${API_BASE_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => undefined)
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
