import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { vi } from 'vitest'
import i18n from '@/i18n'
import type { PageResponse, University } from '@/types/api'
import { UniversitiesPage } from './UniversitiesPage'

const page: PageResponse<University> = {
  content: [
    {
      id: 1, name: 'Test universiteti', shortName: 'TU', city: 'Toshkent', type: 'STATE', rating: 88,
      hasDormitory: true, logoUrl: null, region: { id: 1, code: 'TASHKENT_CITY', name: 'Toshkent shahri' },
    },
  ],
  page: 0, size: 12, totalElements: 1, totalPages: 1,
}

vi.mock('@/api/universities', async (orig) => ({
  ...(await orig<typeof import('@/api/universities')>()),
  fetchUniversities: vi.fn(async () => page),
}))
vi.mock('@/api/reference', async (orig) => ({
  ...(await orig<typeof import('@/api/reference')>()),
  fetchRegions: vi.fn(async () => [{ id: 1, code: 'TASHKENT_CITY', name: 'Toshkent shahri' }]),
}))

function Search() {
  return <output data-testid="search">{useLocation().search}</output>
}

describe('UniversitiesPage', () => {
  beforeEach(() => i18n.changeLanguage('uz'))

  it('renders cards and keeps filters in the URL', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/universities?page=2']}>
          <UniversitiesPage />
          <Search />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(await screen.findByText('Test universiteti')).toBeInTheDocument()
    expect(screen.getByText('1 ta natija')).toBeInTheDocument()

    await screen.findByRole('option', { name: 'Toshkent shahri' })
    await userEvent.selectOptions(screen.getByLabelText('Hudud'), '1')
    // A filter change resets pagination.
    expect(screen.getByTestId('search')).toHaveTextContent('?region=1')
  })
})
