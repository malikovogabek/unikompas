import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'
import { testDraftKey } from './storageKeys'

const user = (id: number) => ({ id, fullName: 'U', email: `u${id}@x.uz`, role: 'APPLICANT' as const, createdAt: '', lastSeenAt: null, loginCount: 0 })

describe('per-user drafts', () => {
  it('are removed when another user signs in', () => {
    void queryClient // ensure the session subscription is registered
    useAuthStore.setState({ token: 'a', expiresAt: null, user: user(1) })
    localStorage.setItem(testDraftKey(1), '{"5":4}')
    useAuthStore.setState({ token: 'b', expiresAt: null, user: user(2) })
    expect(localStorage.getItem(testDraftKey(1))).toBeNull()
  })
})
