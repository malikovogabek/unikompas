import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { Header } from '@/components/layout/Header'
import i18n from '@/i18n'
import { CalculatorPage } from '@/pages/CalculatorPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

vi.mock('@/api/programs', async (orig) => ({
  ...(await orig<typeof import('@/api/programs')>()),
  calculateScore: vi.fn(async () => ({
    mandatoryScore: 26.4, firstSubjectScore: 74.4, secondSubjectScore: 50.4,
    mandatoryMax: 33, firstSubjectMax: 93, secondSubjectMax: 63, total: 151.2, maxTotal: 189,
  })),
}))

function renderPage(ui: ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

/**
 * Automated WCAG 2.1 A/AA checks (NFR-6) with axe-core. Colour contrast is excluded because
 * jsdom does not compute styles; contrast is covered by the design tokens (CLAUDE.md §8.1).
 */
async function expectNoViolations(container: HTMLElement) {
  const result = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  const summary = result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
  expect(summary).toEqual([])
}

describe('accessibility (axe-core)', () => {
  beforeEach(() => i18n.changeLanguage('uz'))

  it.each([
    ['Header', <Header key="h" />],
    ['LoginPage', <LoginPage key="l" />],
    ['RegisterPage', <RegisterPage key="r" />],
  ])('%s has no WCAG A/AA violations', async (_, ui) => {
    const { container } = renderPage(ui)
    await expectNoViolations(container)
  })

  it('CalculatorPage has no WCAG A/AA violations', async () => {
    const { container } = renderPage(<CalculatorPage />)
    await screen.findByText('151,2')
    await expectNoViolations(container)
  })
})
