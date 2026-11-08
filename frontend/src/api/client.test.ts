import { AxiosError, AxiosHeaders } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { api } from './client'

type Rejected = (e: unknown) => Promise<unknown>
// The response interceptor's rejection handler registered in client.ts.
const onRejected = (api.interceptors.response as unknown as { handlers: { rejected: Rejected }[] }).handlers[0]!.rejected

function unauthorized(sentToken: string): AxiosError {
  const config = { headers: new AxiosHeaders({ Authorization: `Bearer ${sentToken}` }), url: '/profile/me' }
  return new AxiosError('401', 'ERR', config, undefined, { status: 401, statusText: '', headers: {}, config, data: {} })
}

describe('401 interceptor', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: 'new', expiresAt: null, user: null })
  })

  it('ignores a late 401 for a previous token', async () => {
    await onRejected(unauthorized('old')).catch(() => undefined)
    expect(useAuthStore.getState().token).toBe('new')
  })

  it('logs out on a 401 for the current token', async () => {
    await onRejected(unauthorized('new')).catch(() => undefined)
    expect(useAuthStore.getState().token).toBeNull()
  })
})
