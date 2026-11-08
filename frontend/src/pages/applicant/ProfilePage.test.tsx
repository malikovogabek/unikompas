import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import i18n from '@/i18n'
import type { Profile } from '@/types/api'
import { ProfilePage } from './ProfilePage'

const profile: Profile = {
  region: { id: 6, code: 'SAMARKAND', name: 'Samarqand viloyati' },
  firstSubject: { id: 1, code: 'MATH', name: 'Matematika' },
  secondSubject: { id: 2, code: 'PHYSICS', name: 'Fizika' },
  expectedScore: 148,
  preferredLanguage: null,
  preferredStudyForm: null,
  financing: 'CONTRACT_OK',
  maxContractFee: 16_000_000,
  willingToRelocate: true,
  fields: [{ id: 1, code: 'IT', name: 'IT', icon: 'cpu' }],
  complete: true,
  updatedAt: null,
}

// Reference lists resolve AFTER the profile — the case that used to reset the selects.
vi.mock('@/api/reference', async (orig) => ({
  ...(await orig<typeof import('@/api/reference')>()),
  fetchRegions: vi.fn(() => new Promise((r) => setTimeout(() => r([{ id: 1, code: 'TASHKENT_CITY', name: 'T' }, { id: 6, code: 'SAMARKAND', name: 'S' }]), 30))),
  fetchSubjects: vi.fn(() => new Promise((r) => setTimeout(() => r([{ id: 1, code: 'MATH', name: 'M' }, { id: 2, code: 'PHYSICS', name: 'P' }]), 30))),
  fetchFields: vi.fn(async () => [{ id: 1, code: 'IT', name: 'IT', icon: 'cpu' }]),
}))
vi.mock('@/api/applicant', async (orig) => ({
  ...(await orig<typeof import('@/api/applicant')>()),
  fetchProfile: vi.fn(async () => profile),
}))

describe('ProfilePage', () => {
  beforeEach(() => i18n.changeLanguage('uz'))

  it('shows the saved region and subjects even when option lists load later', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    const region = await screen.findByLabelText('Yashash hududingiz')
    expect(region).toHaveValue('6')
    expect(screen.getByLabelText('1-mutaxassislik fani')).toHaveValue('1')
    expect(screen.getByLabelText('2-mutaxassislik fani')).toHaveValue('2')
    expect(screen.getByLabelText('Kutilayotgan bal (0–189)')).toHaveValue('148')
  })
})
