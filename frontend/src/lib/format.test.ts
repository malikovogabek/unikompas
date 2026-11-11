import { formatDate, formatInteger, formatPercent, formatRelative, formatScore, formatSum } from './format'

describe('format', () => {
  it('formats money with the localized currency label', () => {
    expect(formatSum(14_500_000, 'uz')).toMatch(/^14\s500\s000 so‘m$/)
    expect(formatScore(153.2, 'uz')).toBe('153,2')
    expect(formatSum(14_500_000, 'ru')).toMatch(/^14\s500\s000 сум$/)
    expect(formatSum(14_500_000, 'en')).toBe('14,500,000 UZS')
  })

  it('formats scores with one decimal and locale separator', () => {
    expect(formatScore(153.2, 'ru')).toBe('153,2')
    expect(formatScore(153, 'en')).toBe('153.0')
  })

  it('formats integers with grouping', () => {
    expect(formatInteger(1250, 'uz')).toMatch(/^1\s250$/)
    expect(formatInteger(1250, 'en')).toBe('1,250')
  })

  it('formats unit values as percent', () => {
    expect(formatPercent(0.874, 'en')).toBe('87%')
    expect(formatPercent(0.874, 'uz')).toBe('87%')
  })

  it('formats relative times in every language', () => {
    const now = Date.parse('2026-11-11T12:00:00Z')
    expect(formatRelative('2026-11-11T11:55:00Z', 'uz', now)).toBe('5 daqiqa oldin')
    expect(formatRelative('2026-11-11T09:00:00Z', 'uz', now)).toBe('3 soat oldin')
    expect(formatRelative('2026-11-10T11:00:00Z', 'uz', now)).toBe('kecha')
    expect(formatRelative('2026-11-07T12:00:00Z', 'uz', now)).toBe('4 kun oldin')
    expect(formatRelative('2026-11-11T11:59:00Z', 'ru', now)).toBe('1 минуту назад')
    expect(formatRelative('2026-11-11T11:57:00Z', 'ru', now)).toBe('3 минуты назад')
    expect(formatRelative('2026-11-11T11:55:00Z', 'ru', now)).toBe('5 минут назад')
    expect(formatRelative('2026-11-11T11:59:00Z', 'en', now)).toBe('1 minute ago')
    expect(formatRelative('2026-11-11T11:55:00Z', 'en', now)).toBe('5 minutes ago')
  })

  it('reads sub-minute and slightly-future times as just now', () => {
    const now = Date.parse('2026-11-11T12:00:00Z')
    expect(formatRelative('2026-11-11T11:59:30Z', 'uz', now)).toBe('hozirgina')
    expect(formatRelative('2026-11-11T12:00:03Z', 'en', now)).toBe('just now')
  })

  it('formats Uzbek dates numerically', () => {
    expect(formatDate('2026-11-08T12:00:00Z', 'uz')).toBe('08.11.2026')
  })
})
