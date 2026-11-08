import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import i18n from '@/i18n'
import { LoginPage } from './LoginPage'

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => i18n.changeLanguage('uz'))

  it('shows translated client-side validation errors', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Kirish' }))
    expect(await screen.findAllByText('Majburiy maydon')).toHaveLength(2)
    expect(screen.getByLabelText('E-pochta')).toHaveAttribute('aria-invalid', 'true')
  })

  it('gives the password toggle its own accessible name', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Parolni ko‘rsatish' })).toBeInTheDocument()
    expect(screen.getByLabelText('Parol')).toHaveAttribute('type', 'password')
  })

  it('switches language without reload', async () => {
    renderPage()
    await i18n.changeLanguage('ru')
    expect(await screen.findByRole('heading', { name: 'С возвращением' })).toBeInTheDocument()
  })
})
