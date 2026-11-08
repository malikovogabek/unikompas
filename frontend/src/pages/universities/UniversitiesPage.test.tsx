import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
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
const fetchMock = vi.hoisted(() => ({ page: 0, totalPages: 1 }))

vi.mock('@/api/universities', async (orig) => ({
  ...(await orig<typeof import('@/api/universities')>()),
  fetchUniversities: vi.fn(async (f: { page?: number }) => ({ ...page, page: f.page ?? 0, totalPages: fetchMock.totalPages })),
}))
vi.mock('@/api/reference', async (orig) => ({
  ...(await orig<typeof import('@/api/reference')>()),
  fetchRegions: vi.fn(async () => [{ id: 1, code: 'TASHKENT_CITY', name: 'Toshkent shahri' }]),
}))

function Search() {
  return <output data-testid="search">{useLocation().search}</output>
}

function renderAt(url: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}>
        <UniversitiesPage />
        <Search />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('UniversitiesPage', () => {
  beforeEach(() => {
    fetchMock.totalPages = 1
    return i18n.changeLanguage('uz')
  })

  it('keeps the page from a shared link and moves forward on Next', async () => {
    fetchMock.totalPages = 5
    renderAt('/universities?page=2')
    expect(await screen.findByText('3 / 5')).toBeInTheDocument()
    expect(screen.getByTestId('search')).toHaveTextContent('?page=2')

    await userEvent.click(screen.getByRole('button', { name: 'Keyingi' }))
    expect(await screen.findByText('4 / 5')).toBeInTheDocument()
    expect(screen.getByTestId('search')).toHaveTextContent('?page=3')
  })

  it('writes typed search to the URL after a debounce and resets the page', async () => {
    fetchMock.totalPages = 5
    renderAt('/universities?page=2')
    await screen.findByText('3 / 5')
    await userEvent.type(screen.getByRole('searchbox'), 'tatu')
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?q=tatu'))
  })

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
