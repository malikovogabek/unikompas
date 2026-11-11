import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { useServerStatusStore } from '@/store/serverStatusStore'
import { api, retryDelaysMs } from './client'

function respond(config: InternalAxiosRequestConfig, status: number, data: unknown = {}) {
  return { data, status, statusText: '', headers: {}, config }
}

describe('API client resilience (free-tier cold start)', () => {
  const original = api.defaults.adapter
  beforeAll(() => retryDelaysMs.splice(0, retryDelaysMs.length, 0, 0, 0, 0))
  afterEach(() => {
    api.defaults.adapter = original
  })

  it('retries network errors and gateway errors, then succeeds', async () => {
    let calls = 0
    const adapter: AxiosAdapter = async (config) => {
      calls++
      if (calls === 1) {
        throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)
      }
      if (calls === 2) {
        throw new AxiosError('Bad Gateway', 'ERR_BAD_RESPONSE', config, undefined, respond(config, 502))
      }
      return respond(config, 200, { accessToken: 't' })
    }
    api.defaults.adapter = adapter
    const res = await api.post('/auth/login', { email: 'a@b.uz', password: 'x' })
    expect(res.data).toEqual({ accessToken: 't' })
    expect(calls).toBe(3)
  })

  it('does not retry real API errors', async () => {
    let calls = 0
    api.defaults.adapter = async (config) => {
      calls++
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, respond(config, 401, { error: 'INVALID_CREDENTIALS' }))
    }
    await expect(api.post('/auth/login', {})).rejects.toBeInstanceOf(AxiosError)
    expect(calls).toBe(1)
  })

  it('gives up after the configured number of retries', async () => {
    let calls = 0
    api.defaults.adapter = async (config) => {
      calls++
      throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)
    }
    await expect(api.get('/regions')).rejects.toBeInstanceOf(AxiosError)
    expect(calls).toBe(1 + retryDelaysMs.length)
  })

  it('raises the slow-server indicator for long requests and clears it afterwards', async () => {
    vi.useFakeTimers()
    let release: () => void = () => undefined
    api.defaults.adapter = (config) =>
      new Promise((resolve) => {
        release = () => resolve(respond(config, 200, []))
      })
    const pending = api.get('/regions', { headers: new AxiosHeaders() })
    await vi.advanceTimersByTimeAsync(3_500)
    expect(useServerStatusStore.getState().slowRequests).toBe(1)
    release()
    await pending
    expect(useServerStatusStore.getState().slowRequests).toBe(0)
    vi.useRealTimers()
  })
})
